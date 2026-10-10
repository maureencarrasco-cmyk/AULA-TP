Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot -Parent
$folder=Join-Path $root 'static/encargo-photos'
$catalog=Get-Content -LiteralPath (Join-Path $folder 'catalog.json') -Raw | ConvertFrom-Json
$entries=@($catalog.PSObject.Properties | Sort-Object Name)
$width=1200;$cols=5;$cellW=240;$cellH=180
$rows=[math]::Ceiling($entries.Count/$cols)
$bitmap=[Drawing.Bitmap]::new($width,$rows*$cellH)
$g=[Drawing.Graphics]::FromImage($bitmap)
$g.Clear([Drawing.Color]::White)
$font=[Drawing.Font]::new('Arial',12)
for($i=0;$i -lt $entries.Count;$i++){
  $entry=$entries[$i];$x=($i%$cols)*$cellW;$y=[math]::Floor($i/$cols)*$cellH
  $img=[Drawing.Image]::FromFile((Join-Path $folder $entry.Value.file))
  $scale=[math]::Min(($cellW-8)/$img.Width,($cellH-32)/$img.Height)
  $w=[int]($img.Width*$scale);$h=[int]($img.Height*$scale)
  $g.DrawImage($img,[int]($x+($cellW-$w)/2),[int]$y,$w,$h)
  $g.DrawString($entry.Name,$font,[Drawing.Brushes]::Black,[single]($x+8),[single]($y+$cellH-27))
  $img.Dispose()
}
$out=Join-Path $root 'reports/encargos-fotos-20261008'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$bitmap.Save((Join-Path $out 'catalogo-contacto.jpg'),[Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose();$font.Dispose();$bitmap.Dispose()
Write-Output (Join-Path $out 'catalogo-contacto.jpg')
