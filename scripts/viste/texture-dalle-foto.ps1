# Ricava le texture ripetibili di data/viste/texture dalle foto dei campioni di effe.it
# (data/viste/texture/originali). Solo Windows: usa System.Drawing.
#   powershell -ExecutionPolicy Bypass -File scripts/viste/texture-dalle-foto.ps1
#
# Scrive anche originali/medie.json, il colore medio di ogni foto: lo usa materiali.mjs per l'ondulino.
#
# Legno e gres: ritaglio quadrato centrale, bordi sfumati sul lato opposto (la texture si ripete
# senza giunte), 512 x 512. Doghe: si misura il passo delle tavole dalla foto, si ritagliano due
# tavole intere e si dispongono 6 x 2 (6 tavole ogni 256 unità del pattern, circa 9 cm l'una; in
# altezza la tavola è allungata, lungo la venatura non si nota). Prima si uniforma la luce riga per riga.
param([string]$Dir = 'data/viste/texture')

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Tex {
  static int[] Px(Bitmap b) {
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    var a = new int[b.Width * b.Height]; Marshal.Copy(d.Scan0, a, 0, a.Length); b.UnlockBits(d); return a;
  }
  static Bitmap Bmp(int[] a, int w, int h) {
    var b = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    var d = b.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    Marshal.Copy(a, 0, d.Scan0, a.Length); b.UnlockBits(d); return b;
  }
  static int Mix(int p, int q, double t) {
    int r = 0;
    for (int s = 0; s < 32; s += 8) {
      int x = (p >> s) & 255, y = (q >> s) & 255;
      r |= ((int)Math.Round(x * (1 - t) + y * t) & 255) << s;
    }
    return r;
  }
  public static Bitmap Crop(Bitmap b, int x, int y, int w, int h) {
    return b.Clone(new Rectangle(x, y, w, h), PixelFormat.Format32bppArgb);
  }
  // Ripetibile in orizzontale: la fascia oltre la larghezza finale si sfuma sull'inizio.
  public static Bitmap SeamX(Bitmap b, int band) {
    int w = b.Width, h = b.Height, n = w - band; var a = Px(b); var o = new int[n * h];
    for (int y = 0; y < h; y++) for (int x = 0; x < n; x++) {
      int p = a[y * w + x];
      o[y * n + x] = x < band ? Mix(a[y * w + x + n], p, (double)x / band) : p;
    }
    return Bmp(o, n, h);
  }
  public static Bitmap SeamY(Bitmap b, int band) {
    int w = b.Width, h = b.Height, n = h - band; var a = Px(b); var o = new int[w * n];
    for (int y = 0; y < n; y++) for (int x = 0; x < w; x++) {
      int p = a[y * w + x];
      o[y * w + x] = y < band ? Mix(a[(y + n) * w + x], p, (double)y / band) : p;
    }
    return Bmp(o, w, n);
  }
  // Toglie le variazioni lente di luce dall'alto in basso: ogni riga torna alla luminosità media.
  public static Bitmap NormRows(Bitmap b, int radius) {
    var a = Px(b); int w = b.Width, h = b.Height; var r = new double[h]; double tot = 0;
    for (int y = 0; y < h; y++) { double s = 0; for (int x = 0; x < w; x++) { int p = a[y * w + x]; s += ((p >> 16) & 255) * .3 + ((p >> 8) & 255) * .59 + (p & 255) * .11; } r[y] = s / w; tot += r[y]; }
    tot /= h; var o = new int[a.Length];
    for (int y = 0; y < h; y++) {
      double s = 0; int k = 0; for (int i = -radius; i <= radius; i++) if (y + i >= 0 && y + i < h) { s += r[y + i]; k++; }
      double g = tot / (s / k);
      for (int x = 0; x < w; x++) {
        int p = a[y * w + x], q = p & unchecked((int)0xFF000000);
        for (int sh = 0; sh < 24; sh += 8) q |= Math.Min(255, (int)Math.Round(((p >> sh) & 255) * g)) << sh;
        o[y * w + x] = q;
      }
    }
    return Bmp(o, w, h);
  }
  // Luminosità media di ogni colonna, smussata.
  public static double[] Columns(Bitmap b) {
    var a = Px(b); int w = b.Width, h = b.Height; var c = new double[w];
    for (int x = 0; x < w; x++) { double s = 0; for (int y = 0; y < h; y++) { int p = a[y * w + x]; s += ((p >> 16) & 255) * .3 + ((p >> 8) & 255) * .59 + (p & 255) * .11; } c[x] = s / h; }
    var m = new double[w];
    for (int x = 0; x < w; x++) { double s = 0; int k = 0; for (int i = -4; i <= 4; i++) if (x + i >= 0 && x + i < w) { s += c[x + i]; k++; } m[x] = s / k; }
    return m;
  }
  // Passo delle tavole: ritardo con la massima autocorrelazione del profilo delle colonne.
  public static int Period(double[] c, int min, int max) {
    double mean = 0; foreach (var v in c) mean += v; mean /= c.Length;
    int best = min; double bv = double.MinValue;
    for (int l = min; l <= max; l++) {
      double s = 0; int k = 0;
      for (int x = 0; x + l < c.Length; x++) { s += (c[x] - mean) * (c[x + l] - mean); k++; }
      s /= k; if (s > bv) { bv = s; best = l; }
    }
    return best;
  }
  public static int Darkest(double[] c, int from, int to) {
    int b = from; for (int x = from; x < to; x++) if (c[x] < c[b]) b = x; return b;
  }
  public static Bitmap Resize(Bitmap b, int w, int h) {
    var o = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(o)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      var at = new ImageAttributes(); at.SetWrapMode(WrapMode.TileFlipXY);
      g.DrawImage(b, new Rectangle(0, 0, w, h), 0, 0, b.Width, b.Height, GraphicsUnit.Pixel, at);
    }
    return o;
  }
  // Griglia cols x rows di tessere, alternate in orizzontale.
  public static Bitmap Grid(Bitmap[] t, int cols, int rows, int size) {
    var o = new Bitmap(size, size, PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(o)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      var at = new ImageAttributes(); at.SetWrapMode(WrapMode.TileFlipXY);
      for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        var b = t[c % t.Length];
        int x0 = c * size / cols, x1 = (c + 1) * size / cols, y0 = r * size / rows, y1 = (r + 1) * size / rows;
        g.DrawImage(b, new Rectangle(x0, y0, x1 - x0, y1 - y0), 0, 0, b.Width, b.Height, GraphicsUnit.Pixel, at);
      }
    }
    return o;
  }
  // Colore medio della foto, "r,g,b".
  public static string Mean(Bitmap b) {
    var a = Px(b); double r = 0, g = 0, bl = 0;
    foreach (var p in a) { r += (p >> 16) & 255; g += (p >> 8) & 255; bl += p & 255; }
    return string.Format("{0},{1},{2}", (int)Math.Round(r / a.Length), (int)Math.Round(g / a.Length), (int)Math.Round(bl / a.Length));
  }
  public static void SaveJpg(Bitmap b, string path, long q) {
    ImageCodecInfo enc = null;
    foreach (var e in ImageCodecInfo.GetImageEncoders()) if (e.MimeType == "image/jpeg") enc = e;
    var p = new EncoderParameters(1); p.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, q);
    b.Save(path, enc, p);
  }
}
'@

$orig = Join-Path $Dir 'originali'
$LATO = 512

# id -> foto: ritaglio quadrato centrale, sfumato sui bordi
$piane = [ordered]@{
  'aspenN'  = 'AspenNaturale-Liscio.jpg'
  'aspenT'  = 'AspenTermotrattato.jpg'
  'rovere'  = 'Rovere-rigatino-1b.jpg'
  'wenge'   = 'Wenge.jpg'
  'moka'    = 'Gres-Masterpiece-Moka.jpg'
  'light'   = 'Gres-Masterpiece-Light-1.jpg'
  'siena'   = 'Gres-Masterpiece-Siena.jpg'
}
foreach ($id in $piane.Keys) {
  $b = New-Object System.Drawing.Bitmap (Join-Path $orig $piane[$id])
  $s = [Math]::Min($b.Width, $b.Height)
  $q = [Tex]::Crop($b, [int](($b.Width - $s) / 2), [int](($b.Height - $s) / 2), $s, $s)
  $q = [Tex]::NormRows($q, [int]($s / 10))
  $band = if ($id -in 'moka', 'light', 'siena') { [int]($s / 16) } else { [int]($s / 8) }   # nel gres una fascia larga sdoppia le scaglie
  $q = [Tex]::SeamY([Tex]::SeamX($q, $band), $band)
  $out = Join-Path $Dir "$id.jpg"
  [Tex]::SaveJpg([Tex]::Resize($q, $LATO, $LATO), $out, 88)
  "{0,-16} {1} -> {2} x {2}, {3} kB" -f $id, $piane[$id], $LATO, [int]((Get-Item $out).Length / 1kb)
  $b.Dispose()
}

# id -> foto a doghe verticali
$doghe = [ordered]@{
  'doghe-aspenT' = 'AspenTermotrattato-Doghe_1-1.jpg'
  'doghe-scuro'  = 'Legno-Termotrattato-Scuro-doghe-2-4.jpg'
}
foreach ($id in $doghe.Keys) {
  $b = [Tex]::NormRows((New-Object System.Drawing.Bitmap (Join-Path $orig $doghe[$id])), 40)
  $c = [Tex]::Columns($b)
  $p = [Tex]::Period($c, 150, 320)
  $band = 16
  $vb = [int]($b.Height / 8)
  # una tessera per tavola intera: da metà di una tavola alla metà della successiva
  $tessere = @()
  $g = [Tex]::Darkest($c, 0, $p)              # prima scanalatura
  $x = $g + [int]($p / 2)                     # metà della tavola dopo
  if ($x + 2 * $p + $band -gt $b.Width) { $x = [Math]::Max(0, $x - $p) }   # per avere due tavole si parte prima
  while ($x + $p + $band -le $b.Width -and $tessere.Count -lt 2) {
    $t = [Tex]::Crop($b, $x, 0, $p + $band, $b.Height)
    $tessere += [Tex]::SeamY([Tex]::SeamX($t, $band), $vb)
    $x += $p
  }
  $out = Join-Path $Dir "$id.jpg"
  [Tex]::SaveJpg([Tex]::Grid($tessere, 6, 2, $LATO), $out, 88)
  "{0,-16} {1}: passo {2} px, {3} tavole diverse -> 6 x 2, {4} kB" -f $id, $doghe[$id], $p, $tessere.Count, [int]((Get-Item $out).Length / 1kb)
  $b.Dispose()
}

# colore medio di ogni foto
$medie = [ordered]@{}
foreach ($f in Get-ChildItem $orig -Filter *.jpg | Sort-Object Name) {
  $b = New-Object System.Drawing.Bitmap $f.FullName
  $medie[$f.Name] = 'rgb(' + [Tex]::Mean($b) + ')'
  $b.Dispose()
}
$json = ($medie | ConvertTo-Json) -replace "`r`n", "`n"
[IO.File]::WriteAllText((Join-Path (Resolve-Path $orig) 'medie.json'), $json + "`n")
"medie.json: {0} foto" -f $medie.Count
