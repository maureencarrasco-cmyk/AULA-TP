$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$manifestPath=Join-Path $root 'static/situation-photos/catalog.json'
$catalog=Get-Content $manifestPath -Raw | ConvertFrom-Json
$photos=@($catalog.PSObject.Properties | ForEach-Object {$_.Value} | Group-Object title | ForEach-Object {$_.Group[0]})
$rejected=@();$evidence=@{}
for($i=0;$i -lt $photos.Count;$i+=40){
 $batch=@($photos | Select-Object -Skip $i -First 40)
 Start-Sleep -Seconds 6
 $url='https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=categories&cllimit=max&titles='+[uri]::EscapeDataString(($batch.title -join '|'))
 $next=$url
 do{
  $result=Invoke-RestMethod -Uri $next -Headers @{'User-Agent'='AulaTPChileSituationPhotos/1.0 (educational local catalog)'}
  foreach($page in $result.query.pages.PSObject.Properties.Value){
   $categories=@($page.categories | ForEach-Object {$_.title})
   $evidence[$page.title]=@($evidence[$page.title] | Where-Object {$_})+$categories
   if(($categories -join ' ') -match 'AI-generated|AI generated|Artificial intelligence.*generat|Midjourney|Stable Diffusion|DALL-E|Paintings|Lithographs|Engravings|Gravestones|Tombs|Postage stamps|Caricatures'){$rejected+=$page.title;Write-Output "REJECTED $($page.title)"}
  }
  $next=if($result.continue.clcontinue){$url+'&continue='+[uri]::EscapeDataString($result.continue.continue)+'&clcontinue='+[uri]::EscapeDataString($result.continue.clcontinue)}else{$null}
  if($next){Start-Sleep -Seconds 6}
 }while($next)
 Write-Output "Verified $([math]::Min($i+40,$photos.Count))/$($photos.Count) sources"
}
$out=Join-Path $root 'reports/situaciones-fotos-20261008'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$evidence | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $out 'categorias-fuentes.json') -Encoding utf8
ConvertTo-Json -InputObject @($rejected) | Set-Content (Join-Path $out 'fuentes-rechazadas.json') -Encoding utf8
