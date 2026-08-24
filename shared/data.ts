import type { Artisan, HeritageLocation, RecognitionExample, Region, Story, Trail } from './types'

const image = (id: string, width = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export const regions: Region[] = [
  {
    id: 'region-kurukshetra', name: 'Kurukshetra', slug: 'kurukshetra', state: 'Haryana', country: 'India',
    description: 'A landscape of ponds, kitchens, craft practices and memory beyond the battlefield narrative.',
    image: image('photo-1605649487212-47bdab064df7'), latitude: 29.9695, longitude: 76.8783,
  },
  {
    id: 'region-haryana', name: 'Haryana', slug: 'haryana', state: 'Haryana', country: 'India',
    description: 'Everyday traditions of courtyards, handwork, seasonal food and shared village life.',
    image: image('photo-1518709268805-4e9042af9f23'), latitude: 29.0588, longitude: 76.0856,
  },
  {
    id: 'region-braj', name: 'Braj', slug: 'braj', state: 'Uttar Pradesh', country: 'India',
    description: 'Music, painted stories and ritual routes shaped by generations of local practitioners.',
    image: image('photo-1548013146-72479768bada'), latitude: 27.4924, longitude: 77.6737,
  },
  {
    id: 'region-marwar', name: 'Marwar', slug: 'marwar', state: 'Rajasthan', country: 'India',
    description: 'Desert craft, water wisdom and food traditions adapted to the Thar landscape.',
    image: image('photo-1477587458883-47145ed94245'), latitude: 26.2389, longitude: 73.0243,
  },
  {
    id: 'region-malabar', name: 'Malabar', slug: 'malabar', state: 'Kerala', country: 'India',
    description: 'Coastal kitchens, ritual performance and material culture rooted in the monsoon.',
    image: image('photo-1602216056096-3b40cc0c9944'), latitude: 11.2588, longitude: 75.7804,
  },
]

const kurukshetra = regions[0]
const haryana = regions[1]
const braj = regions[2]
const marwar = regions[3]
const malabar = regions[4]

export const heritage: HeritageLocation[] = [
  {
    id: 'heritage-brahma-sarovar', regionId: kurukshetra.id, regionName: kurukshetra.name, name: 'Brahma Sarovar at Dawn', slug: 'brahma-sarovar-at-dawn', category: 'Sacred Tradition',
    shortDescription: 'A living water landscape where morning rituals, walking and seasonal gatherings meet.',
    description: 'The broad edges of Brahma Sarovar are best understood as a shared civic and sacred landscape. Dawn brings walkers, families, pilgrims and vendors into the same slow rhythm.',
    culturalSignificance: 'The water body holds meaning through repeated community practice: bathing, prayer, conversation and the annual gatherings that turn its edge into a public room.',
    historicalContext: 'Local memory connects the sarovar to Kurukshetra’s layered sacred geography. This prototype presents the place as a living landscape rather than a single historical claim.',
    livingToday: 'Visit respectfully at sunrise, keep the water edge clear and observe how residents use the promenade before taking photographs.',
    image: image('photo-1548013146-72479768bada'), gallery: [image('photo-1500534623283-312aade485b7'), image('photo-1518005020951-eccb494ad742')], latitude: 29.9693, longitude: 76.8782, durationMinutes: 75,
    tags: ['water', 'ritual', 'sunrise', 'walking', 'local stories'], experienceTypes: ['Quiet & Authentic', 'Photography', 'Deep Historical'], verifiedStatus: 'Research needed',
  },
  {
    id: 'heritage-pipli-craft', regionId: kurukshetra.id, regionName: kurukshetra.name, name: 'Pipli’s Appliqué Courtyards', slug: 'pipli-applique-courtyards', category: 'Craft',
    shortDescription: 'Bright fabric forms and patient hand-stitching carried from workshop tables into everyday celebrations.',
    description: 'In Pipli, cloth becomes canopy, ornament and story. The work is made in small, deliberate gestures: cut a shape, place a colour, stitch an edge and let a pattern find its balance.',
    culturalSignificance: 'Appliqué connects craft skill with public life. Its colours and forms are not confined to a museum; they appear in homes, ceremonies and seasonal decoration.',
    historicalContext: 'The area is known for appliqué traditions that have travelled through changing markets. Exact lineages and community histories should be documented with local practitioners.',
    livingToday: 'Ask before entering a workshop, learn how a motif is made and buy only when the maker is comfortable discussing the work.',
    image: image('photo-1606760227091-3dd870d97f1d'), gallery: [image('photo-1525507119028-ed4c629a60a3'), image('photo-1558618666-fcd25c85cd64')], latitude: 29.9954, longitude: 76.8406, durationMinutes: 90,
    tags: ['textile', 'handwork', 'colour', 'workshop', 'craft'], experienceTypes: ['Cultural & Social', 'Quiet & Authentic', 'Photography'], verifiedStatus: 'Community source',
  },
  {
    id: 'heritage-kurukshetra-kitchen', regionId: kurukshetra.id, regionName: kurukshetra.name, name: 'The Shared Kitchen Table', slug: 'kurukshetra-shared-kitchen', category: 'Food',
    shortDescription: 'Simple Haryana flavours that explain season, grain and hospitality better than a menu can.',
    description: 'The food of the region is a practical archive. Bajra, seasonal greens, buttermilk and slow-cooked pulses speak of fields, weather and the generosity of a kitchen that feeds more than one household.',
    culturalSignificance: 'Recipes survive through repetition and adaptation. The important ingredient is often the context: who cooks, who is welcomed and what the season provides.',
    historicalContext: 'This is a food trail prompt, not a claim about a single canonical recipe. Local kitchens differ by community and family, and that difference is part of the story.',
    livingToday: 'Choose a community-run meal or a small local eatery, ask about ingredients and avoid treating food traditions as a performance.',
    image: image('photo-1601050690597-df0568f70950'), gallery: [image('photo-1515003197210-e0cd71810b5f'), image('photo-1547592180-85f173990554')], latitude: 29.9602, longitude: 76.8647, durationMinutes: 60,
    tags: ['food', 'bajra', 'hospitality', 'seasonal', 'kitchen'], experienceTypes: ['Food-focused', 'Cultural & Social', 'Quiet & Authentic'], verifiedStatus: 'Demonstration content',
  },
  {
    id: 'heritage-sthaneshwar', regionId: kurukshetra.id, regionName: kurukshetra.name, name: 'Sthaneshwar Mahadev Precinct', slug: 'sthaneshwar-mahadev-precinct', category: 'Architecture',
    shortDescription: 'A temple precinct where architecture is inseparable from the daily life around it.',
    description: 'The temple, lane and surrounding activity form one experience. Bells, offerings, painted thresholds and the movement of regular visitors create a place that cannot be reduced to its façade.',
    culturalSignificance: 'Sacred architecture here is maintained by use. It is a place of worship first, and a site of architectural interest second.',
    historicalContext: 'The precinct is associated with Kurukshetra’s sacred geography. Dates and historical details should be verified with local historians before publication.',
    livingToday: 'Dress modestly, follow photography guidance and leave space for worshippers rather than treating the inner precinct as a backdrop.',
    image: image('photo-1564507592333-c60657eea523'), gallery: [image('photo-1532664189809-02133fee698d'), image('photo-1524498250077-390f9e378fc0')], latitude: 29.9699, longitude: 76.8324, durationMinutes: 55,
    tags: ['temple', 'ritual', 'architecture', 'precinct', 'sacred'], experienceTypes: ['Deep Historical', 'Quiet & Authentic', 'Photography'], verifiedStatus: 'Research needed',
  },
  {
    id: 'heritage-pehowa-ghats', regionId: kurukshetra.id, regionName: kurukshetra.name, name: 'Pehowa’s Riverbank Memory', slug: 'pehowa-riverbank-memory', category: 'Local History',
    shortDescription: 'A river-edge town where family memory, ritual movement and old market routes overlap.',
    description: 'Pehowa’s riverbank is a place to listen. Priests, shopkeepers, returning families and local residents hold different memories of the same steps and lanes.',
    culturalSignificance: 'The site shows how heritage can be carried by people and practices even when the built environment changes around them.',
    historicalContext: 'Accounts of the town’s ritual importance vary by source and community. Treat the visit as an invitation to hear local histories, not a final historical verdict.',
    livingToday: 'Keep conversations consent-based and do not photograph private rituals.',
    image: image('photo-1500534623283-312aade485b7'), gallery: [image('photo-1486911278844-a81c5267e227'), image('photo-1500534623283-312aade485b7')], latitude: 29.9782, longitude: 76.5876, durationMinutes: 80,
    tags: ['river', 'memory', 'market', 'ritual', 'walking'], experienceTypes: ['Deep Historical', 'Quiet & Authentic', 'Local Stories' as never], verifiedStatus: 'Research needed', isHidden: true, hiddenReason: 'Less-known in our prototype dataset; local access and context vary.',
  },
  {
    id: 'heritage-ragini-haryana', regionId: haryana.id, regionName: haryana.name, name: 'Ragini on the Village Stage', slug: 'ragini-village-stage', category: 'Folk Culture',
    shortDescription: 'A sung form of storytelling that turns local history into a shared evening.',
    description: 'Ragini performance carries wit, memory and social observation through voice, rhythm and a direct relationship with the audience.',
    culturalSignificance: 'The form stays alive because it is responsive: performers can speak to the moment, the place and the people gathered in front of them.',
    historicalContext: 'This entry describes a living folk form in broad terms. A future version should be shaped with performers and community archives.',
    livingToday: 'Look for community events rather than staged imitations, and support performers directly where possible.',
    image: image('photo-1506157786151-b8491531f063'), gallery: [image('photo-1514525253161-7a46d19cd819')], latitude: 29.6857, longitude: 76.9905, durationMinutes: 120,
    tags: ['music', 'performance', 'oral history', 'community'], experienceTypes: ['Cultural & Social', 'Local Stories' as never, 'Photography'], verifiedStatus: 'Research needed', isHidden: true, hiddenReason: 'Less-known in our prototype dataset; event timing and access vary.',
  },
  {
    id: 'heritage-braj-sanjhi', regionId: braj.id, regionName: braj.name, name: 'Braj’s Paper Sanjhi', slug: 'braj-paper-sanjhi', category: 'Craft',
    shortDescription: 'Fine paper cutwork made for devotion, patience and the small scale of a household altar.',
    description: 'Sanjhi is made through the quiet work of cutting and arranging. The delicate patterns invite a different pace: close looking, steady hands and respect for ritual context.',
    culturalSignificance: 'The craft sits at the meeting point of visual art and devotion, with knowledge passed through practice rather than mass production.',
    historicalContext: 'Traditions of Sanjhi have multiple lineages. This prototype keeps the description intentionally grounded and open to practitioner review.',
    livingToday: 'Ask whether a work is intended for ritual or sale, and follow the maker’s lead when discussing sacred motifs.',
    image: image('photo-1577083552431-6e5fd01d8e99'), gallery: [image('photo-1561214115-f2f134cc4912')], latitude: 27.5054, longitude: 77.6737, durationMinutes: 95,
    tags: ['paper', 'devotion', 'fine work', 'motif'], experienceTypes: ['Quiet & Authentic', 'Photography', 'Cultural & Social'], verifiedStatus: 'Research needed', isHidden: true, hiddenReason: 'Less-known in our prototype dataset; ask practitioners about ritual context.',
  },
  {
    id: 'heritage-marwar-water', regionId: marwar.id, regionName: marwar.name, name: 'Stepwells and Water Memory', slug: 'marwar-stepwells-water-memory', category: 'Community Practice',
    shortDescription: 'Water architecture read through shade, stone, movement and the knowledge of scarcity.',
    description: 'In Marwar, a stepwell is an engineering idea made public. Its depth, shade and approach tell a story about water as a collective responsibility.',
    culturalSignificance: 'The structure connects climate adaptation with social life. Looking closely reveals how design and care worked together.',
    historicalContext: 'Stepwells across Rajasthan differ in age, patronage and condition. Site-specific verification is essential.',
    livingToday: 'Take only photographs, never climb restricted edges and ask residents how the water system relates to the present town.',
    image: image('photo-1599661046289-e31897846e41'), gallery: [image('photo-1599661046289-e31897846e41')], latitude: 26.3022, longitude: 73.0172, durationMinutes: 70,
    tags: ['water', 'climate', 'stone', 'engineering', 'community'], experienceTypes: ['Deep Historical', 'Photography', 'Quiet & Authentic'], verifiedStatus: 'Demonstration content', isHidden: true, hiddenReason: 'Less-known in our prototype dataset; site-specific verification is needed.',
  },
  {
    id: 'heritage-malabar-kitchen', regionId: malabar.id, regionName: malabar.name, name: 'Malabar’s Spice Route Kitchen', slug: 'malabar-spice-route-kitchen', category: 'Food',
    shortDescription: 'A coastal food tradition shaped by trade, monsoon produce and a layered pantry.',
    description: 'Malabar kitchens show how a region can be read through aroma and technique. Coconut, pepper, rice and souring agents move from pantry to plate with a long memory of coastal exchange.',
    culturalSignificance: 'Recipes hold traces of migration and exchange without losing their local character.',
    historicalContext: 'Food histories are plural. This entry should be expanded through conversations with home cooks, fisher communities and local researchers.',
    livingToday: 'Choose small kitchens, ask before photographing and make room for the people who have carried these recipes.',
    image: image('photo-1601050690597-df0568f70950'), gallery: [image('photo-1515003197210-e0cd71810b5f')], latitude: 11.2588, longitude: 75.7804, durationMinutes: 85,
    tags: ['food', 'spice', 'coast', 'monsoon', 'kitchen'], experienceTypes: ['Food-focused', 'Cultural & Social', 'Local Stories' as never], verifiedStatus: 'Demonstration content',
  },
  {
    id: 'heritage-phulkari-circle', regionId: haryana.id, regionName: haryana.name, name: 'Phulkari Memory Circle', slug: 'phulkari-memory-circle', category: 'Craft',
    shortDescription: 'Threads, family stories and patient motifs that turn cloth into a record of belonging.',
    description: 'Phulkari is often discussed as embroidery, but its meaning also lives in who taught whom, which cloth was saved and how a motif travelled through a family.',
    culturalSignificance: 'The work is a social archive made by hand: domestic, visible and full of decisions about colour, time and care.',
    historicalContext: 'Phulkari practices span communities and regions. This demo entry avoids assigning a single origin story.',
    livingToday: 'Buy directly from makers when possible and ask about the time behind the work.',
    image: image('photo-1558618666-fcd25c85cd64'), gallery: [image('photo-1525507119028-ed4c629a60a3')], latitude: 29.1492, longitude: 75.7217, durationMinutes: 75,
    tags: ['textile', 'embroidery', 'family', 'memory', 'craft'], experienceTypes: ['Quiet & Authentic', 'Cultural & Social', 'Photography'], verifiedStatus: 'Community source', isHidden: true, hiddenReason: 'Less-known in our prototype dataset; availability depends on maker schedules.',
  },
]

export const hiddenHeritage = heritage.filter((item) => item.isHidden)

export const recognitionExamples: RecognitionExample[] = [
  { id: 'demo-pipli', label: 'Pipli appliqué textile', heritageSlug: heritage[1].slug, image: heritage[1].image, keywords: ['pipli', 'applique', 'textile', 'fabric', 'craft'] },
  { id: 'demo-sanjhi', label: 'Braj paper Sanjhi', heritageSlug: heritage[6].slug, image: heritage[6].image, keywords: ['sanjhi', 'paper', 'braj', 'stencil'] },
  { id: 'demo-stepwell', label: 'Marwar water architecture', heritageSlug: heritage[7].slug, image: heritage[7].image, keywords: ['stepwell', 'water', 'marwar', 'stone'] },
  { id: 'demo-phulkari', label: 'Phulkari memory textile', heritageSlug: heritage[9].slug, image: heritage[9].image, keywords: ['phulkari', 'embroidery', 'thread', 'textile'] },
]

export const artisans: Artisan[] = [
  {
    id: 'artisan-sunita', name: 'Sunita Devi', slug: 'sunita-devi-applique', craft: 'Appliqué textile', regionId: kurukshetra.id, regionName: kurukshetra.name, location: 'Pipli, Haryana',
    biography: 'Sunita works with layered cotton, turning repeated geometric forms into canopies, wall pieces and household textiles. Her practice is rooted in a workshop shared with other women makers.',
    craftStory: 'For Sunita, the pattern begins with a shape that can be cut by hand and ends with a conversation about colour. The workshop is as much a place to learn as it is to make.', yearsOfExperience: 18,
    profileImage: image('photo-1544005313-94ddf0286df2'), gallery: [image('photo-1525507119028-ed4c629a60a3'), image('photo-1558618666-fcd25c85cd64')], specialties: ['Canopies', 'Geometric motifs', 'Workshop visits'], relatedHeritageIds: ['heritage-pipli-craft'], contactMethod: 'Request an introduction through the local craft collective',
  },
  {
    id: 'artisan-ramesh', name: 'Ramesh Kumar', slug: 'ramesh-kumar-pottery', craft: 'Terracotta pottery', regionId: kurukshetra.id, regionName: kurukshetra.name, location: 'Thanesar, Haryana',
    biography: 'Ramesh learned to prepare clay and work the wheel in his family’s courtyard. He now balances everyday vessels with small experiments in form.', craftStory: 'A pot remembers pressure. Ramesh describes the wheel as a conversation between the hand, the clay and the speed of the turn.', yearsOfExperience: 26,
    profileImage: image('photo-1565193566173-7a0ee3dbe261'), gallery: [image('photo-1565193566173-7a0ee3dbe261'), image('photo-1578749556568-bc2c40e68b61')], specialties: ['Water pots', 'Kitchen vessels', 'Clay demonstrations'], relatedHeritageIds: ['heritage-kurukshetra-kitchen'], contactMethod: 'Mock contact: ask the platform for a studio introduction',
  },
  {
    id: 'artisan-meera', name: 'Meera Kaur', slug: 'meera-kaur-phulkari', craft: 'Phulkari embroidery', regionId: haryana.id, regionName: haryana.name, location: 'Hisar district, Haryana',
    biography: 'Meera stitches with the reverse side of the cloth in mind, keeping a close relationship between pattern, memory and the time a piece takes.', craftStory: 'Her pieces begin with stories told at the sewing circle. A flower may be a place, a person or a season remembered.', yearsOfExperience: 31,
    profileImage: image('photo-1534528741775-53994a69daeb'), gallery: [image('photo-1558618666-fcd25c85cd64'), image('photo-1525507119028-ed4c629a60a3')], specialties: ['Baggage cloths', 'Wedding textiles', 'Motif stories'], relatedHeritageIds: ['heritage-phulkari-circle'], contactMethod: 'Request an introduction through the local craft collective',
  },
  {
    id: 'artisan-rahim', name: 'Abdul Rahim', slug: 'abdul-rahim-sanjhi', craft: 'Paper Sanjhi', regionId: braj.id, regionName: braj.name, location: 'Mathura, Uttar Pradesh',
    biography: 'Abdul Rahim makes intricate paper stencils and teaches visitors how the cut pattern is built one opening at a time.', craftStory: 'The smallest mistake changes the balance of a Sanjhi. Rahim’s studio is a lesson in looking slowly.', yearsOfExperience: 22,
    profileImage: image('photo-1507003211169-0a1dd7228f2d'), gallery: [image('photo-1577083552431-6e5fd01d8e99')], specialties: ['Ritual stencils', 'Paper cutting', 'Demonstrations'], relatedHeritageIds: ['heritage-braj-sanjhi'], contactMethod: 'Request an introduction through the local craft collective',
  },
  {
    id: 'artisan-kamal', name: 'Kamal Singh', slug: 'kamal-singh-ragini', craft: 'Ragini performance', regionId: haryana.id, regionName: haryana.name, location: 'Rohtak, Haryana',
    biography: 'Kamal performs and teaches Ragini, adapting old meters to contemporary village gatherings and local stories.', craftStory: 'He keeps a notebook of phrases heard in markets, on buses and at family gatherings. The performance begins there.', yearsOfExperience: 19,
    profileImage: image('photo-1500648767791-00dcc994a43e'), gallery: [image('photo-1506157786151-b8491531f063')], specialties: ['Oral history', 'Community performance', 'Teaching'], relatedHeritageIds: ['heritage-ragini-haryana'], contactMethod: 'Request an introduction before a community performance',
  },
  {
    id: 'artisan-gopal', name: 'Gopal Singh', slug: 'gopal-singh-leatherwork', craft: 'Hand-tooled leatherwork', regionId: marwar.id, regionName: marwar.name, location: 'Jodhpur, Rajasthan',
    biography: 'Gopal makes durable leather goods with hand tools and a strong preference for repairable construction.', craftStory: 'The workshop is organised around use: a strap should soften, a seam should be repairable and the material should not be treated as disposable.', yearsOfExperience: 24,
    profileImage: image('photo-1506794778202-cad84cf45f1d'), gallery: [image('photo-1528698827591-e19ccd7bc23d')], specialties: ['Saddlery', 'Repair', 'Tooling'], relatedHeritageIds: ['heritage-marwar-water'], contactMethod: 'Mock contact: request an introduction through the craft network',
  },
  {
    id: 'artisan-lakshmi', name: 'Lakshmi Amma', slug: 'lakshmi-amma-malabar-kitchen', craft: 'Malabar home cooking', regionId: malabar.id, regionName: malabar.name, location: 'Kozhikode, Kerala',
    biography: 'Lakshmi hosts small food conversations around a family kitchen, with recipes adjusted to the monsoon and the market.', craftStory: 'Her recipes are rarely written in exact measures. Guests learn by watching the colour of the spice and listening for the right sound in the pan.', yearsOfExperience: 42,
    profileImage: image('photo-1580489944761-15a19d654956'), gallery: [image('photo-1515003197210-e0cd71810b5f'), image('photo-1547592180-85f173990554')], specialties: ['Seasonal cooking', 'Spice knowledge', 'Food stories'], relatedHeritageIds: ['heritage-malabar-kitchen'], contactMethod: 'Request a small-group kitchen introduction',
  },
  {
    id: 'artisan-bimla', name: 'Bimla Kumari', slug: 'bimla-kumari-basketry', craft: 'Moonj basketry', regionId: kurukshetra.id, regionName: kurukshetra.name, location: 'Kurukshetra district, Haryana',
    biography: 'Bimla works with locally available grasses, making storage baskets and teaching younger makers how to prepare the fibre.', craftStory: 'Her work begins before the weave: knowing when to gather, how to dry and which fibre will hold its shape.', yearsOfExperience: 16,
    profileImage: image('photo-1531123897727-8f129e1688ce'), gallery: [image('photo-1529946825183-7f7b60c41a26')], specialties: ['Storage baskets', 'Fibre preparation', 'Maker circles'], relatedHeritageIds: ['heritage-kurukshetra-kitchen'], contactMethod: 'Request an introduction through the local craft collective',
  },
]

export const stories: Story[] = [
  {
    id: 'story-water-memory', title: 'What a Waterbody Remembers', slug: 'what-a-waterbody-remembers', regionId: kurukshetra.id, regionName: kurukshetra.name, category: 'Landscape & memory',
    excerpt: 'At Kurukshetra’s water edges, the morning belongs to many kinds of people at once.', image: image('photo-1500534623283-312aade485b7'),
    content: ['A waterbody is easy to describe from a distance. It is harder to understand from the edge, where a walker pauses beside a family preparing an offering and a vendor begins the first tea of the day.', 'At Brahma Sarovar, the landscape is held together by repeated use. The significance of the place is not only in what a guidebook says about it, but in the people who return, maintain, interpret and share it.', 'A responsible visit makes room for that continuity. Look, listen and let the place remain more complicated than a photo caption.'], relatedHeritageIds: ['heritage-brahma-sarovar', 'heritage-pehowa-ghats'], relatedArtisanIds: ['artisan-bimla'],
  },
  {
    id: 'story-colour-pipli', title: 'The Geometry of a Shared Courtyard', slug: 'the-geometry-of-a-shared-courtyard', regionId: kurukshetra.id, regionName: kurukshetra.name, category: 'Craft & community',
    excerpt: 'In Pipli, colour is built from patient decisions made around a workshop table.', image: image('photo-1606760227091-3dd870d97f1d'),
    content: ['A bright textile begins with quiet work. Fabric is folded, cut and placed. A shape that looks simple from across the room can take a practiced hand to make cleanly.', 'Pipli’s appliqué tradition is often encountered as colour. Spend longer and another story appears: shared tools, repeated teaching and an understanding that the work belongs to a living social setting.', 'The best souvenir is not a transaction without context. It is a work whose maker, material and time can be named.'], relatedHeritageIds: ['heritage-pipli-craft'], relatedArtisanIds: ['artisan-sunita'],
  },
  {
    id: 'story-bajra-table', title: 'A Grain, a Season, a Welcome', slug: 'a-grain-a-season-a-welcome', regionId: kurukshetra.id, regionName: kurukshetra.name, category: 'Food traditions',
    excerpt: 'Regional food is a map of weather, work and the people a household expects at its table.', image: image('photo-1515003197210-e0cd71810b5f'),
    content: ['A local kitchen can explain a landscape without a lecture. Bajra, greens, buttermilk and pulses reveal what stores well, what arrives with the season and what makes a meal feel complete.', 'Recipes change from family to family. That variation is not a failure of authenticity; it is evidence that a food tradition is still being used.', 'When you eat with a local kitchen, ask about the ingredient and listen to the answer. The story is in the relationship, not only in the dish.'], relatedHeritageIds: ['heritage-kurukshetra-kitchen'], relatedArtisanIds: ['artisan-lakshmi', 'artisan-ramesh'],
  },
  {
    id: 'story-ragini', title: 'A Voice Finds Its Audience', slug: 'a-voice-finds-its-audience', regionId: haryana.id, regionName: haryana.name, category: 'Folk performance',
    excerpt: 'Ragini remains alive because the performer can still speak to the people in front of them.', image: image('photo-1506157786151-b8491531f063'),
    content: ['The village stage is not a sealed archive. It is a room where an old meter meets a current concern, where the audience knows when a line lands and where the performer adjusts.', 'That responsiveness is the point. Living heritage is not a performance frozen in one approved form; it is knowledge made present by people who continue to practice it.', 'Attend with attention. A performance is not background music for a camera; it is a social exchange.'], relatedHeritageIds: ['heritage-ragini-haryana'], relatedArtisanIds: ['artisan-kamal'],
  },
  {
    id: 'story-sanjhi', title: 'The Patience of Paper', slug: 'the-patience-of-paper', regionId: braj.id, regionName: braj.name, category: 'Craft & devotion',
    excerpt: 'A Sanjhi stencil asks the eye to slow down and the hand to trust the next cut.', image: image('photo-1577083552431-6e5fd01d8e99'),
    content: ['Paper looks fragile until you see what a practiced cut can hold. A pattern grows from openings, each one changing the balance of the whole.', 'In Braj, Sanjhi sits close to devotion. The distinction between craft and worship is not always useful here; the making itself can be an act of attention.', 'Meet the maker before you buy the motif. Context makes the work legible.'], relatedHeritageIds: ['heritage-braj-sanjhi'], relatedArtisanIds: ['artisan-rahim'],
  },
  {
    id: 'story-stepwell', title: 'Shade Is Also Infrastructure', slug: 'shade-is-also-infrastructure', regionId: marwar.id, regionName: marwar.name, category: 'Architecture & climate',
    excerpt: 'Stepwells show how practical knowledge can be given a civic and beautiful form.', image: image('photo-1599661046289-e31897846e41'),
    content: ['A stepwell is an argument made in stone: water deserves care, shade changes what is possible and a resource becomes stronger when its management is public.', 'The design is often admired as architecture. It should also be read as climate knowledge, built around scarcity and collective use.', 'A visit should leave the structure intact. The best view is the one that makes room for the people who still live with the questions it was built to answer.'], relatedHeritageIds: ['heritage-marwar-water'], relatedArtisanIds: ['artisan-gopal'],
  },
  {
    id: 'story-phulkari', title: 'A Family Written in Thread', slug: 'a-family-written-in-thread', regionId: haryana.id, regionName: haryana.name, category: 'Textile memory',
    excerpt: 'An embroidered cloth can carry a family’s sense of place without a single written sentence.', image: image('photo-1558618666-fcd25c85cd64'),
    content: ['Thread crosses cloth in small decisions. A flower becomes larger, a border changes direction and a colour is chosen because it recalls a person or a ceremony.', 'Phulkari is often catalogued as an object. In a household, it can be a record of relationships: who made it, who received it and what was happening when the work was underway.', 'Ask about the time inside the textile. That is where the history starts.'], relatedHeritageIds: ['heritage-phulkari-circle'], relatedArtisanIds: ['artisan-meera'],
  },
  {
    id: 'story-malabar-pantry', title: 'The Pantry Has a Coastline', slug: 'the-pantry-has-a-coastline', regionId: malabar.id, regionName: malabar.name, category: 'Food & exchange',
    excerpt: 'In a Malabar kitchen, the coast appears in the balance of spice, coconut, rice and sourness.', image: image('photo-1601050690597-df0568f70950'),
    content: ['The pantry is a map. It records what grows nearby, what arrives by sea, what keeps through the monsoon and what a household has learned to make its own.', 'Malabar food traditions hold many histories at once. Trade and migration matter, but so do the small choices made at the stove every day.', 'A food experience should begin with permission and end with gratitude, not extraction.'], relatedHeritageIds: ['heritage-malabar-kitchen'], relatedArtisanIds: ['artisan-lakshmi'],
  },
]

export const sampleTrails: Trail[] = [
  {
    id: 'trail-water-and-memory', name: 'Water & Memory in Kurukshetra', regionId: kurukshetra.id, regionName: kurukshetra.name, duration: 210, interests: ['Local Stories', 'History'], experienceType: 'Deep Historical', timeChoice: 'Half day', createdAt: '2026-01-01T00:00:00.000Z',
    stops: [heritage[0], heritage[4], heritage[3]].map((stop, index) => ({ ...stop, matchReason: ['Begin with the quiet scale of a shared water edge.', 'Listen for the family histories held by a riverbank town.', 'End with a sacred precinct still shaped by daily use.'][index], distanceFromPreviousKm: index === 0 ? undefined : 8.2 })),
  },
  {
    id: 'trail-hands-and-hearths', name: 'Hands & Hearths of Haryana', regionId: kurukshetra.id, regionName: kurukshetra.name, duration: 235, interests: ['Crafts', 'Food'], experienceType: 'Cultural & Social', timeChoice: 'Half day', createdAt: '2026-01-01T00:00:00.000Z',
    stops: [heritage[1], heritage[2], heritage[9]].map((stop, index) => ({ ...stop, matchReason: ['See how colour is assembled by hand.', 'Taste a regional table shaped by season and grain.', 'Follow the material story into a family craft circle.'][index], distanceFromPreviousKm: index === 0 ? undefined : 3.7 })),
  },
  {
    id: 'trail-beyond-the-monument', name: 'Beyond the Monument', regionId: kurukshetra.id, regionName: kurukshetra.name, duration: 150, interests: ['Photography', 'Local Stories'], experienceType: 'Quiet & Authentic', timeChoice: '2 hours', createdAt: '2026-01-01T00:00:00.000Z',
    stops: [heritage[0], heritage[1]].map((stop, index) => ({ ...stop, matchReason: ['A dawn landscape for patient looking.', 'Patterns, shadows and workshop details for close photography.'][index], distanceFromPreviousKm: index === 0 ? undefined : 5.4 })),
  },
]

export const demoData = { regions, heritage, artisans, stories, sampleTrails }
