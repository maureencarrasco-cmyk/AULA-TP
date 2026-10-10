Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot -Parent
$catalog=Get-Content (Join-Path $root 'static/situation-photos/catalog.json') -Raw | ConvertFrom-Json
$out=Join-Path $root 'reports/situaciones-fotos-20261008/contactos'
New-Item -ItemType Directory -Force -Path $out | Out-Null
foreach($entry in $catalog.PSObject.Properties){
 $items=@($entry.Value);$w=1000;$cellW=200;$cellH=150
 $bitmap=[Drawing.Bitmap]::new($w,[int](30+[math]::Ceiling($items.Count/5)*$cellH))
 $g=[Drawing.Graphics]::FromImage($bitmap);$g.Clear([Drawing.Color]::White)
 $font=[Drawing.Font]::new('Arial',10)
 $g.DrawString($entry.Name,$font,[Drawing.Brushes]::Black,5,5)
 for($i=0;$i -lt $items.Count;$i++){
  $item=$items[$i];$img=[Drawing.Image]::FromFile((Join-Path $root $item.image.TrimStart('/')))
  $scale=[math]::Min(($cellW-8)/$img.Width,($cellH-22)/$img.Height)
  $iw=[int]($img.Width*$scale);$ih=[int]($img.Height*$scale);$x=($i%5)*$cellW;$y=30+[math]::Floor($i/5)*$cellH
  $g.DrawImage($img,[int]($x+($cellW-$iw)/2),[int]$y,$iw,$ih)
  $g.DrawString([string]($i+1),$font,[Drawing.Brushes]::Black,[single]($x+5),[single]($y+$cellH-20));$img.Dispose()
 }
 $bitmap.Save((Join-Path $out ($entry.Name+'.jpg')),[Drawing.Imaging.ImageFormat]::Jpeg)
 $g.Dispose();$font.Dispose();$bitmap.Dispose()
}
Write-Output $out
