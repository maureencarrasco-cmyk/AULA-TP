param([string[]]$Topics=@(),[int]$Count=15)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$folder=Join-Path $root 'static/situation-photos'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$source=Get-Content (Join-Path $root 'static/encargo-photos/catalog.json') -Raw | ConvertFrom-Json
$manifestPath=Join-Path $folder 'catalog.json'
$catalog=@{}
if(Test-Path $manifestPath){(Get-Content $manifestPath -Raw | ConvertFrom-Json).PSObject.Properties | ForEach-Object {$catalog[$_.Name]=@($_.Value)}}
$reviewPath=Join-Path $root 'scripts/situation-photo-review.json'
$rejectedImages=@{}
if(Test-Path $reviewPath){
 (Get-Content $reviewPath -Raw | ConvertFrom-Json).rejectedImages | ForEach-Object {$rejectedImages[$_]=1}
}
$headers=@{'User-Agent'='AulaTPChileSituationPhotos/1.0 (educational local catalog)'}
$reject='generated|artificial intelligence|midjourney|stable diffusion|engraving|painting|illustration|cartoon|historical|circa|19[0-8][0-9]|DPLA|LCCN|EFTA|AlfredPalmer|Sumerian|Fortepan|Wellcome|lithograph|museum|watch|undefined|statue|portrait|badge|protest|diving tower|diving platform|Diving Tower Park|ancient|Pompeii|exhibition|sidewalk|archaeology|stamp|balloon|table tennis|pocket calculator|bike|bicycle|scooter|James Dyson|Andrew Morton|Andy Hunt|Luc Saffre|John Dunn|Matt Puempel|Mika Zibanedjad'
$required=@{
 motor='motor|asynchron|induction|elektromotor|moteur'; programming='programmer|coding|developer.*work|software.*work|programming|informatics.*terminal|code.*computer';
 laboratory='laborator|laboratory|chemistry lab|chemist|research.*scientist'; thermometer='thermomet|termometr'; microscope='microscop|mikroskop';
 diving='diver|diving|buceo|compressor|harness|air panel'; hatchery='hatchery|fish.*tank|fish.*egg|broodstock|fish.*fry';
 electrical='electric|wiring|cable|switchboard'; cooling='conditioner|hvac|refrigerat|climat'; aircraft='aircraft|airplane|aviation|aeroplane';
 plans='drafting|blueprint|technical.*drawing|architect.*draw|architect.*plan|drawing.*desk'; drawing='drafting|blueprint|technical.*drawing|architect.*draw|architect.*plan|drawing.*desk'; geology='geolog|rock|field|strata|outcrop|core sample|drill core';
 accounting='calculat|account|bookkeep|finance|ledger'; molds='mold|mould|injection'; textile='sewing|textile|garment|weav';
 office='office|laptop|business|work.*computer'; tourism='tour.*guide|guide.*tour|guided.*tour';
 forestry='harvester|forestry|logging|forester'; furniture='carpent|woodwork|furniture';
 preschool='classroom|kindergarten|preschool'; pressure='manomet|pressure.*gauge|gauge.*pressure|regassing';
 electronics='solder|circuit|pcb|electronic'; nursing='nurse|nursing|patient|hospital';
 assembly='crane|lifting|assembly|industrial'; plumbing='plumb|pipe|piping';
 food='food|bakery|packaging'; construction='construct|concrete|worker';
 silviculture='planting|seedling|forest'; seedling='seedling|nursery|plant'; mining='mining|mine|miner|drill|drilling|excavator|quarry|core sample'; rocks='rock|geolog|mineral|core sample|drill core|outcrop';
}
$searches=@{
 hatchery=@('intitle:"fish hatchery"','intitle:"fish eggs"'); aquaculture=@('intitle:aquaculture','intitle:"fish farm"');
 fishing=@('intitle:"fishing net"','intitle:fishermen'); ship=@('intitle:"ship bridge"','intitle:wheelhouse'); port=@('intitle:"container port"','intitle:"container crane"');
 cooling=@('intitle:"air conditioner"','intitle:refrigeration'); electrical=@('intitle:"electrical wiring"','intitle:"electrical panel"');
 nursing=@('intitle:nurse AND patient','intitle:nursing'); cooking=@('intitle:chef AND cooking','intitle:"commercial kitchen"'); bakery=@('intitle:bakery AND dough','intitle:baker AND bread');
 hotel=@('intitle:"hotel reception"','intitle:hotel AND receptionist'); accounting=@('intitle:calculator','intitle:accounting');
 food=@('intitle:"food factory"','intitle:"food processing"'); textile=@('intitle:"sewing machine"','intitle:"garment factory"'); plumbing=@('intitle:plumbing','intitle:plumber');
 assembly=@('intitle:"industrial crane"','intitle:"industrial assembly"'); electronics=@('intitle:soldering','intitle:"printed circuit board"');
 drawing=@('intitle:"drafting table"','intitle:"technical drawing"'); plans=@('intitle:"drafting table"','intitle:"technical drawing"'); printing=@('intitle:"offset printing"','intitle:"printing press"');
 tourism=@('intitle:"tour guide"','intitle:"guided tour"'); forestry=@('intitle:"forest harvester"','intitle:forestry AND machine'); furniture=@('intitle:woodworking','intitle:carpenter');
 welding=@('intitle:welder','intitle:welding'); car=@('intitle:"car mechanic"','intitle:"car repair"'); aircraft=@('intitle:"aircraft maintenance"','intitle:"aircraft engine"');
 geology=@('intitle:"geology fieldwork"','intitle:"geological mapping"','intitle:"drill core"','intitle:"core samples"','intitle:"rock samples"'); mining=@('intitle:"open pit mining"','intitle:"underground mining"','intitle:"mining drill"','intitle:"mine geologist"','intitle:"mining excavator"'); metallurgy=@('intitle:"steel furnace"','intitle:foundry');
 preschool=@('intitle:"kindergarten classroom"','intitle:"preschool classroom"'); network=@('intitle:"network switch"','intitle:"ethernet cables"');
 programming=@('intitle:"software developer at work"','intitle:programmer AND computer'); telecom=@('intitle:"telecommunications antenna"','intitle:"telecommunication tower"');
 warehouse=@('intitle:warehouse AND forklift','intitle:"warehouse storage"'); office=@('intitle:"office workers"','intitle:businesswoman AND laptop');
 crops=@('intitle:greenhouse AND agriculture','intitle:"vegetable farming"'); cattle=@('intitle:cattle AND feeding','intitle:"dairy cows"'); vineyard=@('intitle:"grape harvest"','intitle:vineyard');
 construction=@('intitle:"concrete pouring"','intitle:"construction workers"'); road=@('intitle:"asphalt paving"','intitle:"road construction"'); laboratory=@('intitle:"chemistry laboratory"','intitle:chemist AND laboratory');
 plant=@('intitle:"chemical plant"','intitle:"chemical factory"'); machining=@('intitle:"metal lathe"','intitle:machining'); molds=@('intitle:"injection mold"','intitle:"injection mould"');
 motor=@('intitle:"electric motor"','intitle:"induction motor"'); thermometer=@('intitle:"digital thermometer"','intitle:"dial thermometer"'); bloodpressure=@('intitle:"blood pressure"','intitle:sphygmomanometer');
 medication=@('intitle:pharmacist','intitle:medication'); handwash=@('intitle:"washing hands"','intitle:handwashing'); firstaid=@('intitle:"first aid training"','intitle:"first aid"');
 buffet=@('intitle:buffet','intitle:"hotel breakfast"'); cocktails=@('intitle:bartender','intitle:cocktail'); wine=@('intitle:"wine production"','intitle:"wine barrels"');
 irrigation=@('intitle:"drip irrigation"','intitle:irrigation'); seedlings=@('intitle:"plant nursery"','intitle:seedlings'); dairy=@('intitle:"milking parlour"','intitle:milking');
 fire=@('intitle:"wildland firefighters"','intitle:"forest firefighters"'); timber=@('intitle:sawmill','intitle:"timber processing"'); concrete=@('intitle:"slump test"','intitle:"concrete testing"');
 roof=@('intitle:"roof construction"','intitle:roofing'); tiles=@('intitle:"floor tiling"','intitle:"ceramic floor"'); multimeter=@('intitle:"digital multimeter"','intitle:multimeter');
 server=@('intitle:"server rack"','intitle:"data center"'); caliper=@('intitle:"vernier caliper"','intitle:"digital caliper"'); tools=@('intitle:"hand tools"','intitle:"mechanic tools"');
 safety=@('intitle:"safety helmet"','intitle:"construction helmet"'); engine=@('intitle:"ship engine"','intitle:"marine engine"'); waste=@('intitle:"waste sorting"','intitle:"recycling plant"');
 meeting=@('intitle:"business meeting"','intitle:"office meeting"'); diving=@('intitle:"commercial diving"','intitle:"diving equipment"'); microscope=@('intitle:"laboratory microscope"','intitle:microscope AND laboratory');
 packaging=@('intitle:"food packaging"','intitle:"packaging line"'); enginecar=@('intitle:"car engine"','intitle:"engine repair"'); rocks=@('intitle:"core samples"','intitle:"exploration geologist"');
 silviculture=@('intitle:"tree planting"','intitle:silviculture'); pressure=@('intitle:manometer','intitle:"pressure gauge"'); coolingtubes=@('intitle:"refrigerant pipe"','intitle:"air conditioning" AND pipes');
}
foreach($entry in $source.PSObject.Properties){
 $topic=$entry.Name; $base=$entry.Value
 if($Topics.Count -and $topic -notin $Topics){continue}
 $rows=@($catalog[$topic] | Where-Object {$_ -and !$rejectedImages.ContainsKey($_.image) -and ($_.title+' '+$_.description) -notmatch $reject -and (!$required.ContainsKey($topic) -or $_.title -match $required[$topic])})
 if($rows.Count -ge $Count){continue}
 if(!$rows.Count){$rows+= [ordered]@{image=('/static/encargo-photos/'+$base.file);title=$base.title;alt=$base.alt;source=$base.source;author=$base.author;license=$base.license;licenseUrl=$base.licenseUrl;description=$base.description}}
 $queries=if($searches.ContainsKey($topic)){$searches[$topic]}else{@($base.query)}
 foreach($query in $queries){
  if($rows.Count -ge $Count){break}
  Start-Sleep -Seconds 6
  $search=[uri]::EscapeDataString($query+' filetype:bitmap -drawing -illustration -diagram -logo -cartoon -map -AI -painting -engraving -DPLA -LCCN')
  $url='https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=50&gsrsearch='+$search+'&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=640'
  try{$result=Invoke-RestMethod -Uri $url -Headers $headers}catch{Write-Output "SEARCH FAILED $topic : $_";continue}
  foreach($page in @($result.query.pages.PSObject.Properties.Value | Sort-Object index)){
   if($rows.Count -ge $Count){break}
   $info=$page.imageinfo[0];$meta=$info.extmetadata
   $description=[regex]::Replace([string]$meta.ImageDescription.value,'<[^>]*>','').Trim()
   if($page.title -notmatch '\.jpe?g$' -or $info.width -lt 640 -or $info.height -lt 360 -or [string]$meta.LicenseShortName.value -notmatch '^(CC0|Public domain|CC BY|CC-BY)' -or ($page.title+' '+$description) -match $reject -or ($required.ContainsKey($topic) -and $page.title -notmatch $required[$topic])){continue}
   if(@($rows | Where-Object {$_.source -eq $info.descriptionurl}).Count){continue}
   $sha=[System.Security.Cryptography.SHA256]::Create()
   $hash=[BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($info.descriptionurl))).Replace('-','').Substring(0,12).ToLowerInvariant()
   $file=$topic+'-'+$hash+'.jpg'
   $download=if($info.thumburl){$info.thumburl}else{$info.url}
   try{Invoke-WebRequest -Uri $download -Headers $headers -OutFile (Join-Path $folder $file)}catch{Write-Output "DOWNLOAD FAILED $topic : $($page.title)";continue}
   $rows+=[ordered]@{image=('/static/situation-photos/'+$file);title=$page.title;alt=($page.title -replace '^File:','' -replace '\.jpe?g$','');source=$info.descriptionurl;author=([regex]::Replace([string]$meta.Artist.value,'<[^>]*>','')).Trim();license=$meta.LicenseShortName.value;licenseUrl=$meta.LicenseUrl.value;description=$description}
   $catalog[$topic]=$rows
   $catalog | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $manifestPath -Encoding utf8
   Write-Output "$topic $($rows.Count)/$Count : $($page.title)"
  }
 }
 $catalog[$topic]=$rows
 $catalog | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $manifestPath -Encoding utf8
 Write-Output "SUBJECT $topic : $($rows.Count)"
}
