param([string[]]$Refresh=@())
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$folder = Join-Path $root 'static/encargo-photos'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$topics = [ordered]@{
  hatchery='fish hatchery tanks'; aquaculture='aquaculture fish farm'; fishing='fishing net fishermen'; ship='ship bridge navigation'; port='intitle:container intitle:port';
  cooling='intitle:air intitle:conditioner intitle:outdoor -snow'; electrical='intitle:electrician -Bene'; nursing='intitle:nurse intitle:patient'; cooking='chef cooking kitchen'; bakery='baker dough bakery'; hotel='intitle:hotel intitle:reception -Palace';
  accounting='intitle:calculator'; food='intitle:food intitle:factory -Maistas'; textile='sewing machine garment factory'; plumbing='intitle:plumbing -key'; assembly='industrial crane lifting'; electronics='intitle:soldering'; drawing='intitle:drafting'; printing='offset printing machine'; tourism='tour guide group'; forestry='intitle:forest intitle:harvester'; furniture='carpenter woodworking';
  welding='intitle:welder -Alfred'; car='automobile mechanic engine'; aircraft='intitle:aircraft intitle:maintenance'; geology='intitle:geologist'; mining='underground mining drilling'; metallurgy='steel furnace foundry'; preschool='intitle:kindergarten intitle:classroom -DPLA'; network='network switch ethernet cables'; programming='computer programmer coding'; telecom='telecommunications antenna'; warehouse='warehouse forklift'; office='intitle:office intitle:workers'; crops='agriculture greenhouse'; cattle='intitle:cattle intitle:feeding'; vineyard='vineyard grape harvest'; construction='construction concrete workers'; road='road construction asphalt paving'; laboratory='intitle:chemistry intitle:laboratory -garbage -bin'; plant='chemical plant pipes'; machining='metal lathe machining'; molds='intitle:injection intitle:mold -VR';
  thermometer='digital thermometer'; bloodpressure='nurse blood pressure'; medication='pharmacist medicines pharmacy'; handwash='washing hands soap'; firstaid='first aid training mannequin'; buffet='buffet food hotel'; cocktails='bartender cocktail'; wine='wine production barrels'; irrigation='agricultural irrigation drip'; seedlings='plant nursery seedlings'; dairy='intitle:milking intitle:cows -Sumerian -Temple'; fire='forest firefighters'; timber='sawmill wood'; concrete='concrete slump test'; roof='roof construction'; tiles='intitle:tiling intitle:floor'; multimeter='digital multimeter'; motor='electric motor industrial'; server='intitle:server intitle:rack -EFTA'; caliper='intitle:caliper -PSF'; tools='mechanic hand tools'; plans='intitle:drafting intitle:table'; safety='construction worker safety helmet'; engine='ship engine room'; waste='recycling sorting waste'; meeting='business meeting'; diving='commercial diving'; microscope='laboratory microscope'; packaging='food packaging production'; enginecar='car engine repair'; rocks='intitle:core intitle:samples'; silviculture='tree planting forest';
  pressure='intitle:manometer'; coolingtubes='intitle:refrigerant intitle:pipe';
}
$topics['safety']='intitle:construction intitle:helmet'
$topics['engine']='intitle:ship intitle:engine -model'
$topics['meeting']='intitle:business intitle:meeting -crop -portrait'
$topics['microscope']='intitle:microscope intitle:laboratory -LCCN'
$topics['silviculture']='intitle:tree intitle:planting -1973'
$selectedTitles=@{
  cooling='File:LG AIR CONDITIONER OUTDOOR UNIT (2).jpg'
  electrical='File:Electrical-wiring-rough-in.jpg'
  nursing='File:Nurse checks blood pressure.jpg'
  hotel='File:The hotel reception.jpg'
  food='File:SSF Costco bakery pastry packaging line.JPG'
  plumbing='File:Plumbing Installation (8909644).jpg'
  electronics='File:Soldering a 0805.jpg'
  drawing='File:Drafting table.jpg'
  plans='File:Drafting table.jpg'
  molds='File:Mold for injection plastic with two cavites.jpg'
  geology='File:Students in the field.jpg'
  rocks='File:Exploration geologist.jpg'
  safety='File:Cologne Germany Safety-helmet-with-headset-01.jpg'
  preschool='File:KG classroom-2019 in Cairo.jpg'
  office='File:Businesswoman has coffee and snacks while working on laptop.jpg'
  laboratory='File:Chemistry lab.jpg'
  dairy='File:Milking parlour in Obory in Poland 01.jpg'
  cattle='File:Dairy cows feeding on baled haylage - geograph.org.uk - 580085.jpg'
  engine='File:Champlain main engines.jpg'
  caliper='File:Vernier Caliper.jpg'
  pressure='File:Regassing the aircon of a Ford Focus 2017 02.jpg'
  coolingtubes='File:Regassing the aircon of a Ford Focus 2017 02.jpg'
  accounting='File:Calculatrice Canon.jpg'
  forestry='File:Komatsu 931 forest harvester (c144) 1.jpg'
  irrigation='File:Greenhouse agriculture in Namibia.jpg'
  fire='File:Wildland firefighters in Yosemite National Park (0d000816-c2cb-479c-b20b-9ca492b1e773).jpg'
  thermometer='File:Digital Thermometer TES-1302.jpg'
  construction='File:Concrete pouring for the new Spangdahlem Elementary School (8062804).jpg'
  medication='File:US Navy 030819-N-9593R-082 Pharmacist Randal Heller, right, verifies the dosage and medication of a prescription at the National Naval Medical Center in Bethesda, Maryland.jpg'
}
$manifestPath = Join-Path $folder 'catalog.json'
$catalog = @{}
if (Test-Path $manifestPath) {
  $existing = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  foreach ($p in $existing.PSObject.Properties) { $catalog[$p.Name] = $p.Value }
}
foreach($key in $catalog.Keys){
  if(!$selectedTitles.ContainsKey($key)){$selectedTitles[$key]=$catalog[$key].title}
}
foreach ($key in $topics.Keys) {
  if ($Refresh.Count -and $key -notin $Refresh) { continue }
  if (!$Refresh.Count -and $catalog.ContainsKey($key) -and (Test-Path (Join-Path $root ('static/encargo-photos/'+$catalog[$key].file)))) { continue }
  try {
    Start-Sleep -Seconds 6
    $query = [uri]::EscapeDataString($topics[$key]+' filetype:bitmap -drawing -illustration -diagram -logo -cartoon -map -AI')
    $url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch='+$query+'&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=640'
    if($selectedTitles.ContainsKey($key)) {
      $url='https://commons.wikimedia.org/w/api.php?action=query&format=json&redirects=1&titles='+[uri]::EscapeDataString($selectedTitles[$key])+'&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize&iiurlwidth=640'
    }
    $result = Invoke-RestMethod -Uri $url -Headers @{'User-Agent'='AulaTPPhotoCatalog/1.0 (educational project)'}
    $pages = @($result.query.pages.PSObject.Properties.Value | Sort-Object index)
    $selected = $null
    foreach ($page in $pages) {
      $info = $page.imageinfo[0]
      $license = [string]$info.extmetadata.LicenseShortName.value
      if (($info.width -ge 640 -or ($selectedTitles.ContainsKey($key) -and $info.width -ge 400)) -and $info.height -ge 300 -and $license -match 'CC0|Public domain|CC BY|CC-BY' -and $page.title -match '\.jpe?g$' -and $page.title -notmatch 'circa|c1895|19[0-5][0-9]|DPLA|EFTA|PSF|AlfredPalmer|Sumerian|snow covers|key\.jpg|Badges|drawing of|engraving|painting|illustration|cartoon|generated|historical') { $selected=$page; break }
    }
    if (!$selected) { throw 'No reusable photographic candidate found' }
    $info = $selected.imageinfo[0]
    $ext = [IO.Path]::GetExtension(([uri]$info.url).AbsolutePath).ToLowerInvariant()
    $file = $key+$ext
    $download = if ($info.thumburl) { $info.thumburl } else { $info.url }
    try { Invoke-WebRequest -Uri $download -OutFile (Join-Path $folder $file) -Headers @{'User-Agent'='AulaTPPhotoCatalog/1.0'} }
    catch { Invoke-WebRequest -Uri $info.url -OutFile (Join-Path $folder $file) -Headers @{'User-Agent'='AulaTPPhotoCatalog/1.0'} }
    $catalog[$key] = [ordered]@{file=$file; title=$selected.title; source=$info.descriptionurl; author=([regex]::Replace([string]$info.extmetadata.Artist.value,'<[^>]*>','')).Trim(); license=$info.extmetadata.LicenseShortName.value; licenseUrl=$info.extmetadata.LicenseUrl.value; description=([regex]::Replace([string]$info.extmetadata.ImageDescription.value,'<[^>]*>','')).Trim(); query=$topics[$key]}
    $catalog | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding utf8
    Write-Output "$key : $($selected.title)"
    Start-Sleep -Milliseconds 300
  } catch {
    Write-Output "PENDING $key : $_"
    if ([string]$_ -match 'too many|429') { Write-Output 'Rate limit: stopped; resume after cooldown.'; break }
  }
}
