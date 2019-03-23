(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var writeGood = require('write-good');
chrome.runtime.onMessage.addListener(function (msg, sender, callback) {
    console.log('runtime.onMessage fired', msg);
    if (msg === 'analyze_doc') {
        var allPages = document.querySelector('.kix-paginateddocumentplugin');
        var txts = textNodes(allPages);
        var nodeMap = {};
        for (var i = 0; i < txts.length; i++) {
            var txt = txts[i].textContent;
            if (txt.trim() == "") {
                continue;
            }
            var suggestions = writeGood(txt);
            for (var j = suggestions.length - 1; j >= 0; j--) {
                var s = suggestions[j];
                txt = txt.substring(0, s.index) + '<strong>' + txt.substring(s.index, s.index + s.offset) + '</strong>' + txt.substring(s.index + s.offset);
            }
            nodeMap[txts[i].textContent] = txt;
        }
        console.debug('writeGood: ', nodeMap);
        callback('success');
    }
});
function textNodes(node) {
    if (!node)
        return [];
    var all = [];
    for (node = node.firstChild; node; node = node.nextSibling) {
        if (node.nodeType == 3)
            all.push(node);
        else
            all = all.concat(textNodes(node));
    }
    return all;
}

},{"write-good":15}],2:[function(require,module,exports){
const adverbs = [
  'absolutel',
  'accidentall',
  'additionall',
  'allegedl',
  'alternativel',
  'angril',
  'anxiousl',
  'approximatel',
  'awkwardl',
  'badl',
  'barel',
  'beautifull',
  'blindl',
  'boldl',
  'bravel',
  'brightl',
  'briskl',
  'bristl',
  'bubbl',
  'busil',
  'calml',
  'carefull',
  'carelessl',
  'cautiousl',
  'cheerfull',
  'clearl',
  'closel',
  'coldl',
  'completel',
  'consequentl',
  'correctl',
  'courageousl',
  'crinkl',
  'cruell',
  'crumbl',
  'cuddl',
  'currentl',
  'daringl',
  'deadl',
  'definitel',
  'deliberatel',
  'doubtfull',
  'dumbl',
  'eagerl',
  'earl',
  'easil',
  'elegantl',
  'enormousl',
  'enthusiasticall',
  'equall',
  'especiall',
  'eventuall',
  'exactl',
  'exceedingl',
  'exclusivel',
  'extremel',
  'fairl',
  'faithfull',
  'fatall',
  'fiercel',
  'finall',
  'fondl',
  'foolishl',
  'fortunatel',
  'frankl',
  'franticall',
  'generousl',
  'gentl',
  'giggl',
  'gladl',
  'gracefull',
  'greedil',
  'happil',
  'hardl',
  'hastil',
  'healthil',
  'heartil',
  'helpfull',
  'honestl',
  'hourl',
  'hungril',
  'hurriedl',
  'immediatel',
  'impatientl',
  'inadequatel',
  'ingeniousl',
  'innocentl',
  'inquisitivel',
  'interestingl',
  'irritabl',
  'jiggl',
  'joyousl',
  'justl',
  'kindl',
  'largel',
  'latel',
  'lazil',
  'likel',
  'literall',
  'lonel',
  'loosel',
  'loudl',
  'loudl',
  'luckil',
  'madl',
  'man',
  'mentall',
  'mildl',
  'mortall',
  'mostl',
  'mysteriousl',
  'neatl',
  'nervousl',
  'noisil',
  'normall',
  'obedientl',
  'occasionall',
  'onl',
  'openl',
  'painfull',
  'particularl',
  'patientl',
  'perfectl',
  'politel',
  'poorl',
  'powerfull',
  'presumabl',
  'previousl',
  'promptl',
  'punctuall',
  'quarterl',
  'quickl',
  'quietl',
  'rapidl',
  'rarel',
  'reall',
  'recentl',
  'recklessl',
  'regularl',
  'relativel',
  'reluctantl',
  'remarkabl',
  'repeatedl',
  'rightfull',
  'roughl',
  'rudel',
  'sadl',
  'safel',
  'selfishl',
  'sensibl',
  'seriousl',
  'sharpl',
  'shortl',
  'shyl',
  'significantl',
  'silentl',
  'simpl',
  'sleepil',
  'slowl',
  'smartl',
  'smell',
  'smoothl',
  'softl',
  'solemnl',
  'sparkl',
  'speedil',
  'stealthil',
  'sternl',
  'stupidl',
  'substantiall',
  'successfull',
  'suddenl',
  'surprisingl',
  'suspiciousl',
  'swiftl',
  'tenderl',
  'tensel',
  'thoughtfull',
  'tightl',
  'timel',
  'truthfull',
  'unexpectedl',
  'unfortunatel',
  'usuall',
  'ver',
  'victoriousl',
  'violentl',
  'vivaciousl',
  'warml',
  'waverl',
  'weakl',
  'wearil',
  'wildl',
  'wisel',
  'worldl',
  'wrinkl'
];

const weakens = [
  'just',
  'maybe',
  'stuff',
  'things'
];

const adverbRegex = new RegExp(
  `${'\\b('
  + '('}${adverbs.join('|')})(y)`
  + `|(${weakens.join('|')}))\\b`, 'gi'
);
const matcher = require('./matcher');

module.exports = function matchAdverbs(text) {
  return matcher(adverbRegex, text);
};

},{"./matcher":3}],3:[function(require,module,exports){
function matcher(regex, text) {
  const results = [];
  let result = regex.exec(text);

  while (result) {
    results.push({ index: result.index, offset: result[0].length });
    result = regex.exec(text);
  }

  return results;
}

module.exports = matcher;

},{}],4:[function(require,module,exports){
var toBe = [
    'am',
    'are',
    'aren\'t',
    'be',
    'been',
    'being',
    'he\'s',
    'here\'s',
    'here\'s',
    'how\'s',
    'i\'m',
    'is',
    'isn\'t',
    'she\'s',
    'that\'s',
    'there\'s',
    'they\'re',
    'was',
    'wasn\'t',
    'we\'re',
    'were',
    'weren\'t',
    'what\'s',
    'where\'s',
    'who\'s',
    'you\'re'
];

var re = new RegExp('\\b(' + toBe.join('|') + ')\\b', 'gi');

module.exports = function (text) {
    var suggestions = [];
    if (!text || text.length === 0) return suggestions;
    text = text.replace(/[\u2018\u2019]/g, "'"); // convert smart quotes
    while (match = re.exec(text)) {
        var be = match[0].toLowerCase();
        suggestions.push({
            index: match.index,
            offset: be.length
        });
    }

    return suggestions;
};
},{}],5:[function(require,module,exports){
const cliches = [
  'a chip off the old block',
  'a clean slate',
  'a dark and stormy night',
  'a far cry',
  'a fine kettle of fish',
  'a loose cannon',
  'a penny saved is a penny earned',
  'a tough row to hoe',
  'a word to the wise',
  'ace in the hole',
  'acid test',
  'add insult to injury',
  'against all odds',
  'air your dirty laundry',
  'all fun and games',
  'all in a day\'s work',
  'all talk, no action',
  'all thumbs',
  'all your eggs in one basket',
  'all\'s fair in love and war',
  'all\'s well that ends well',
  'almighty dollar',
  'American as apple pie',
  'an axe to grind',
  'another day, another dollar',
  'armed to the teeth',
  'as luck would have it',
  'as old as time',
  'as the crow flies',
  'at loose ends',
  'at my wits end',
  'avoid like the plague',
  'babe in the woods',
  'back against the wall',
  'back in the saddle',
  'back to square one',
  'back to the drawing board',
  'bad to the bone',
  'badge of honor',
  'bald faced liar',
  'ballpark figure',
  'banging your head against a brick wall',
  'baptism by fire',
  'barking up the wrong tree',
  'bat out of hell',
  'be all and end all',
  'beat a dead horse',
  'beat around the bush',
  'been there, done that',
  'beggars can\'t be choosers',
  'behind the eight ball',
  'bend over backwards',
  'benefit of the doubt',
  'bent out of shape',
  'best thing since sliced bread',
  'bet your bottom dollar',
  'better half',
  'better late than never',
  'better mousetrap',
  'better safe than sorry',
  'between a rock and a hard place',
  'beyond the pale',
  'bide your time',
  'big as life',
  'big cheese',
  'big fish in a small pond',
  'big man on campus',
  'bigger they are the harder they fall',
  'bird in the hand',
  'bird\'s eye view',
  'birds and the bees',
  'birds of a feather flock together',
  'bit the hand that feeds you',
  'bite the bullet',
  'bite the dust',
  'bitten off more than he can chew',
  'black as coal',
  'black as pitch',
  'black as the ace of spades',
  'blast from the past',
  'bleeding heart',
  'blessing in disguise',
  'blind ambition',
  'blind as a bat',
  'blind leading the blind',
  'blood is thicker than water',
  'blood sweat and tears',
  'blow off steam',
  'blow your own horn',
  'blushing bride',
  'boils down to',
  'bolt from the blue',
  'bone to pick',
  'bored stiff',
  'bored to tears',
  'bottomless pit',
  'boys will be boys',
  'bright and early',
  'brings home the bacon',
  'broad across the beam',
  'broken record',
  'brought back to reality',
  'bull by the horns',
  'bull in a china shop',
  'burn the midnight oil',
  'burning question',
  'burning the candle at both ends',
  'burst your bubble',
  'bury the hatchet',
  'busy as a bee',
  'by hook or by crook',
  'call a spade a spade',
  'called onto the carpet',
  'calm before the storm',
  'can of worms',
  'can\'t cut the mustard',
  'can\'t hold a candle to',
  'case of mistaken identity',
  'cat got your tongue',
  'cat\'s meow',
  'caught in the crossfire',
  'caught red-handed',
  'checkered past',
  'chomping at the bit',
  'cleanliness is next to godliness',
  'clear as a bell',
  'clear as mud',
  'close to the vest',
  'cock and bull story',
  'cold shoulder',
  'come hell or high water',
  'cool as a cucumber',
  'cool, calm, and collected',
  'cost a king\'s ransom',
  'count your blessings',
  'crack of dawn',
  'crash course',
  'creature comforts',
  'cross that bridge when you come to it',
  'crushing blow',
  'cry like a baby',
  'cry me a river',
  'cry over spilt milk',
  'crystal clear',
  'curiosity killed the cat',
  'cut and dried',
  'cut through the red tape',
  'cut to the chase',
  'cute as a bugs ear',
  'cute as a button',
  'cute as a puppy',
  'cuts to the quick',
  'dark before the dawn',
  'day in, day out',
  'dead as a doornail',
  'devil is in the details',
  'dime a dozen',
  'divide and conquer',
  'dog and pony show',
  'dog days',
  'dog eat dog',
  'dog tired',
  'don\'t burn your bridges',
  'don\'t count your chickens',
  'don\'t look a gift horse in the mouth',
  'don\'t rock the boat',
  'don\'t step on anyone\'s toes',
  'don\'t take any wooden nickels',
  'down and out',
  'down at the heels',
  'down in the dumps',
  'down the hatch',
  'down to earth',
  'draw the line',
  'dressed to kill',
  'dressed to the nines',
  'drives me up the wall',
  'dull as dishwater',
  'dyed in the wool',
  'eagle eye',
  'ear to the ground',
  'early bird catches the worm',
  'easier said than done',
  'easy as pie',
  'eat your heart out',
  'eat your words',
  'eleventh hour',
  'even the playing field',
  'every dog has its day',
  'every fiber of my being',
  'everything but the kitchen sink',
  'eye for an eye',
  'face the music',
  'facts of life',
  'fair weather friend',
  'fall by the wayside',
  'fan the flames',
  'feast or famine',
  'feather your nest',
  'feathered friends',
  'few and far between',
  'fifteen minutes of fame',
  'filthy vermin',
  'fine kettle of fish',
  'fish out of water',
  'fishing for a compliment',
  'fit as a fiddle',
  'fit the bill',
  'fit to be tied',
  'flash in the pan',
  'flat as a pancake',
  'flip your lid',
  'flog a dead horse',
  'fly by night',
  'fly the coop',
  'follow your heart',
  'for all intents and purposes',
  'for the birds',
  'for what it\'s worth',
  'force of nature',
  'force to be reckoned with',
  'forgive and forget',
  'fox in the henhouse',
  'free and easy',
  'free as a bird',
  'fresh as a daisy',
  'full steam ahead',
  'fun in the sun',
  'garbage in, garbage out',
  'gentle as a lamb',
  'get a kick out of',
  'get a leg up',
  'get down and dirty',
  'get the lead out',
  'get to the bottom of',
  'get your feet wet',
  'gets my goat',
  'gilding the lily',
  'give and take',
  'go against the grain',
  'go at it tooth and nail',
  'go for broke',
  'go him one better',
  'go the extra mile',
  'go with the flow',
  'goes without saying',
  'good as gold',
  'good deed for the day',
  'good things come to those who wait',
  'good time was had by all',
  'good times were had by all',
  'greased lightning',
  'greek to me',
  'green thumb',
  'green-eyed monster',
  'grist for the mill',
  'growing like a weed',
  'hair of the dog',
  'hand to mouth',
  'happy as a clam',
  'happy as a lark',
  'hasn\'t a clue',
  'have a nice day',
  'have high hopes',
  'have the last laugh',
  'haven\'t got a row to hoe',
  'head honcho',
  'head over heels',
  'hear a pin drop',
  'heard it through the grapevine',
  'heart\'s content',
  'heavy as lead',
  'hem and haw',
  'high and dry',
  'high and mighty',
  'high as a kite',
  'hit paydirt',
  'hold your head up high',
  'hold your horses',
  'hold your own',
  'hold your tongue',
  'honest as the day is long',
  'horns of a dilemma',
  'horse of a different color',
  'hot under the collar',
  'hour of need',
  'I beg to differ',
  'icing on the cake',
  'if the shoe fits',
  'if the shoe were on the other foot',
  'in a jam',
  'in a jiffy',
  'in a nutshell',
  'in a pig\'s eye',
  'in a pinch',
  'in a word',
  'in hot water',
  'in the gutter',
  'in the nick of time',
  'in the thick of it',
  'in your dreams',
  'it ain\'t over till the fat lady sings',
  'it goes without saying',
  'it takes all kinds',
  'it takes one to know one',
  'it\'s a small world',
  'it\'s only a matter of time',
  'ivory tower',
  'Jack of all trades',
  'jockey for position',
  'jog your memory',
  'joined at the hip',
  'judge a book by its cover',
  'jump down your throat',
  'jump in with both feet',
  'jump on the bandwagon',
  'jump the gun',
  'jump to conclusions',
  'just a hop, skip, and a jump',
  'just the ticket',
  'justice is blind',
  'keep a stiff upper lip',
  'keep an eye on',
  'keep it simple, stupid',
  'keep the home fires burning',
  'keep up with the Joneses',
  'keep your chin up',
  'keep your fingers crossed',
  'kick the bucket',
  'kick up your heels',
  'kick your feet up',
  'kid in a candy store',
  'kill two birds with one stone',
  'kiss of death',
  'knock it out of the park',
  'knock on wood',
  'knock your socks off',
  'know him from Adam',
  'know the ropes',
  'know the score',
  'knuckle down',
  'knuckle sandwich',
  'knuckle under',
  'labor of love',
  'ladder of success',
  'land on your feet',
  'lap of luxury',
  'last but not least',
  'last hurrah',
  'last-ditch effort',
  'law of the jungle',
  'law of the land',
  'lay down the law',
  'leaps and bounds',
  'let sleeping dogs lie',
  'let the cat out of the bag',
  'let the good times roll',
  'let your hair down',
  'let\'s talk turkey',
  'letter perfect',
  'lick your wounds',
  'lies like a rug',
  'life\'s a bitch',
  'life\'s a grind',
  'light at the end of the tunnel',
  'lighter than a feather',
  'lighter than air',
  'like clockwork',
  'like father like son',
  'like taking candy from a baby',
  'like there\'s no tomorrow',
  'lion\'s share',
  'live and learn',
  'live and let live',
  'long and short of it',
  'long lost love',
  'look before you leap',
  'look down your nose',
  'look what the cat dragged in',
  'looking a gift horse in the mouth',
  'looks like death warmed over',
  'loose cannon',
  'lose your head',
  'lose your temper',
  'loud as a horn',
  'lounge lizard',
  'loved and lost',
  'low man on the totem pole',
  'luck of the draw',
  'luck of the Irish',
  'make hay while the sun shines',
  'make money hand over fist',
  'make my day',
  'make the best of a bad situation',
  'make the best of it',
  'make your blood boil',
  'man of few words',
  'man\'s best friend',
  'mark my words',
  'meaningful dialogue',
  'missed the boat on that one',
  'moment in the sun',
  'moment of glory',
  'moment of truth',
  'money to burn',
  'more power to you',
  'more than one way to skin a cat',
  'movers and shakers',
  'moving experience',
  'naked as a jaybird',
  'naked truth',
  'neat as a pin',
  'needle in a haystack',
  'needless to say',
  'neither here nor there',
  'never look back',
  'never say never',
  'nip and tuck',
  'nip it in the bud',
  'no guts, no glory',
  'no love lost',
  'no pain, no gain',
  'no skin off my back',
  'no stone unturned',
  'no time like the present',
  'no use crying over spilled milk',
  'nose to the grindstone',
  'not a hope in hell',
  'not a minute\'s peace',
  'not in my backyard',
  'not playing with a full deck',
  'not the end of the world',
  'not written in stone',
  'nothing to sneeze at',
  'nothing ventured nothing gained',
  'now we\'re cooking',
  'off the top of my head',
  'off the wagon',
  'off the wall',
  'old hat',
  'older and wiser',
  'older than dirt',
  'older than Methuselah',
  'on a roll',
  'on cloud nine',
  'on pins and needles',
  'on the bandwagon',
  'on the money',
  'on the nose',
  'on the rocks',
  'on the spot',
  'on the tip of my tongue',
  'on the wagon',
  'on thin ice',
  'once bitten, twice shy',
  'one bad apple doesn\'t spoil the bushel',
  'one born every minute',
  'one brick short',
  'one foot in the grave',
  'one in a million',
  'one red cent',
  'only game in town',
  'open a can of worms',
  'open and shut case',
  'open the flood gates',
  'opportunity doesn\'t knock twice',
  'out of pocket',
  'out of sight, out of mind',
  'out of the frying pan into the fire',
  'out of the woods',
  'out on a limb',
  'over a barrel',
  'over the hump',
  'pain and suffering',
  'pain in the',
  'panic button',
  'par for the course',
  'part and parcel',
  'party pooper',
  'pass the buck',
  'patience is a virtue',
  'pay through the nose',
  'penny pincher',
  'perfect storm',
  'pig in a poke',
  'pile it on',
  'pillar of the community',
  'pin your hopes on',
  'pitter patter of little feet',
  'plain as day',
  'plain as the nose on your face',
  'play by the rules',
  'play your cards right',
  'playing the field',
  'playing with fire',
  'pleased as punch',
  'plenty of fish in the sea',
  'point with pride',
  'poor as a church mouse',
  'pot calling the kettle black',
  'pretty as a picture',
  'pull a fast one',
  'pull your punches',
  'pulling your leg',
  'pure as the driven snow',
  'put it in a nutshell',
  'put one over on you',
  'put the cart before the horse',
  'put the pedal to the metal',
  'put your best foot forward',
  'put your foot down',
  'quick as a bunny',
  'quick as a lick',
  'quick as a wink',
  'quick as lightning',
  'quiet as a dormouse',
  'rags to riches',
  'raining buckets',
  'raining cats and dogs',
  'rank and file',
  'rat race',
  'reap what you sow',
  'red as a beet',
  'red herring',
  'reinvent the wheel',
  'rich and famous',
  'rings a bell',
  'ripe old age',
  'ripped me off',
  'rise and shine',
  'road to hell is paved with good intentions',
  'rob Peter to pay Paul',
  'roll over in the grave',
  'rub the wrong way',
  'ruled the roost',
  'running in circles',
  'sad but true',
  'sadder but wiser',
  'salt of the earth',
  'scared stiff',
  'scared to death',
  'sealed with a kiss',
  'second to none',
  'see eye to eye',
  'seen the light',
  'seize the day',
  'set the record straight',
  'set the world on fire',
  'set your teeth on edge',
  'sharp as a tack',
  'shoot for the moon',
  'shoot the breeze',
  'shot in the dark',
  'shoulder to the wheel',
  'sick as a dog',
  'sigh of relief',
  'signed, sealed, and delivered',
  'sink or swim',
  'six of one, half a dozen of another',
  'skating on thin ice',
  'slept like a log',
  'slinging mud',
  'slippery as an eel',
  'slow as molasses',
  'smart as a whip',
  'smooth as a baby\'s bottom',
  'sneaking suspicion',
  'snug as a bug in a rug',
  'sow wild oats',
  'spare the rod, spoil the child',
  'speak of the devil',
  'spilled the beans',
  'spinning your wheels',
  'spitting image of',
  'spoke with relish',
  'spread like wildfire',
  'spring to life',
  'squeaky wheel gets the grease',
  'stands out like a sore thumb',
  'start from scratch',
  'stick in the mud',
  'still waters run deep',
  'stitch in time',
  'stop and smell the roses',
  'straight as an arrow',
  'straw that broke the camel\'s back',
  'strong as an ox',
  'stubborn as a mule',
  'stuff that dreams are made of',
  'stuffed shirt',
  'sweating blood',
  'sweating bullets',
  'take a load off',
  'take one for the team',
  'take the bait',
  'take the bull by the horns',
  'take the plunge',
  'takes one to know one',
  'takes two to tango',
  'the more the merrier',
  'the real deal',
  'the real McCoy',
  'the red carpet treatment',
  'the same old story',
  'there is no accounting for taste',
  'thick as a brick',
  'thick as thieves',
  'thin as a rail',
  'think outside of the box',
  'third time\'s the charm',
  'this day and age',
  'this hurts me worse than it hurts you',
  'this point in time',
  'three sheets to the wind',
  'through thick and thin',
  'throw in the towel',
  'tie one on',
  'tighter than a drum',
  'time and time again',
  'time is of the essence',
  'tip of the iceberg',
  'tired but happy',
  'to coin a phrase',
  'to each his own',
  'to make a long story short',
  'to the best of my knowledge',
  'toe the line',
  'tongue in cheek',
  'too good to be true',
  'too hot to handle',
  'too numerous to mention',
  'touch with a ten foot pole',
  'tough as nails',
  'trial and error',
  'trials and tribulations',
  'tried and true',
  'trip down memory lane',
  'twist of fate',
  'two cents worth',
  'two peas in a pod',
  'ugly as sin',
  'under the counter',
  'under the gun',
  'under the same roof',
  'under the weather',
  'until the cows come home',
  'unvarnished truth',
  'up the creek',
  'uphill battle',
  'upper crust',
  'upset the applecart',
  'vain attempt',
  'vain effort',
  'vanquish the enemy',
  'vested interest',
  'waiting for the other shoe to drop',
  'wakeup call',
  'warm welcome',
  'watch your p\'s and q\'s',
  'watch your tongue',
  'watching the clock',
  'water under the bridge',
  'weather the storm',
  'weed them out',
  'week of Sundays',
  'went belly up',
  'wet behind the ears',
  'what goes around comes around',
  'what you see is what you get',
  'when it rains, it pours',
  'when push comes to shove',
  'when the cat\'s away',
  'when the going gets tough, the tough get going',
  'white as a sheet',
  'whole ball of wax',
  'whole hog',
  'whole nine yards',
  'wild goose chase',
  'will wonders never cease?',
  'wisdom of the ages',
  'wise as an owl',
  'wolf at the door',
  'words fail me',
  'work like a dog',
  'world weary',
  'worst nightmare',
  'worth its weight in gold',
  'wrong side of the bed',
  'yanking your chain',
  'yappy as a dog',
  'years young',
  'you are what you eat',
  'you can run but you can\'t hide',
  'you only live once',
  'you\'re the boss ',
  'young and foolish',
  'young and vibrant',
];

const clicheRegex = new RegExp(`\\b(${cliches.join('|')})\\b`, 'gi');
const matcher = require('./matcher');

module.exports = function clichesMatcher(text) {
  return matcher(clicheRegex, text);
};

},{"./matcher":6}],6:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],7:[function(require,module,exports){
var irregulars = [
  'awoken',
  'been',
  'born',
  'beat',
  'become',
  'begun',
  'bent',
  'beset',
  'bet',
  'bid',
  'bidden',
  'bound',
  'bitten',
  'bled',
  'blown',
  'broken',
  'bred',
  'brought',
  'broadcast',
  'built',
  'burnt',
  'burst',
  'bought',
  'cast',
  'caught',
  'chosen',
  'clung',
  'come',
  'cost',
  'crept',
  'cut',
  'dealt',
  'dug',
  'dived',
  'done',
  'drawn',
  'dreamt',
  'driven',
  'drunk',
  'eaten',
  'fallen',
  'fed',
  'felt',
  'fought',
  'found',
  'fit',
  'fled',
  'flung',
  'flown',
  'forbidden',
  'forgotten',
  'foregone',
  'forgiven',
  'forsaken',
  'frozen',
  'gotten',
  'given',
  'gone',
  'ground',
  'grown',
  'hung',
  'heard',
  'hidden',
  'hit',
  'held',
  'hurt',
  'kept',
  'knelt',
  'knit',
  'known',
  'laid',
  'led',
  'leapt',
  'learnt',
  'left',
  'lent',
  'let',
  'lain',
  'lighted',
  'lost',
  'made',
  'meant',
  'met',
  'misspelt',
  'mistaken',
  'mown',
  'overcome',
  'overdone',
  'overtaken',
  'overthrown',
  'paid',
  'pled',
  'proven',
  'put',
  'quit',
  'read',
  'rid',
  'ridden',
  'rung',
  'risen',
  'run',
  'sawn',
  'said',
  'seen',
  'sought',
  'sold',
  'sent',
  'set',
  'sewn',
  'shaken',
  'shaven',
  'shorn',
  'shed',
  'shone',
  'shod',
  'shot',
  'shown',
  'shrunk',
  'shut',
  'sung',
  'sunk',
  'sat',
  'slept',
  'slain',
  'slid',
  'slung',
  'slit',
  'smitten',
  'sown',
  'spoken',
  'sped',
  'spent',
  'spilt',
  'spun',
  'spit',
  'split',
  'spread',
  'sprung',
  'stood',
  'stolen',
  'stuck',
  'stung',
  'stunk',
  'stridden',
  'struck',
  'strung',
  'striven',
  'sworn',
  'swept',
  'swollen',
  'swum',
  'swung',
  'taken',
  'taught',
  'torn',
  'told',
  'thought',
  'thrived',
  'thrown',
  'thrust',
  'trodden',
  'understood',
  'upheld',
  'upset',
  'woken',
  'worn',
  'woven',
  'wed',
  'wept',
  'wound',
  'won',
  'withheld',
  'withstood',
  'wrung',
  'written'
];

var exceptions = [
  'indeed',
];

var re = new RegExp('\\b(am|are|were|being|is|been|was|be)\\b\\s*([\\w]+ed|' + irregulars.join('|') + ')\\b', 'gi');
var byRe; // lazly construct

module.exports = function (text, options) {
  var r = (options && options.by) ?
          (byRe || constructByRe()) : re; // not sorry

  var suggestions = [];
  while (match = r.exec(text)) {
    if (exceptions.indexOf(match[2].toLowerCase()) === -1) {
      suggestions.push({
        index: match.index,
        offset: match[0].length
      });
    }
  }
  return suggestions;
}

// lol
function constructByRe () {
  return byRe = new RegExp(re.toString().slice(1, -3) + '\\s*by\\b', 'gi');
}

},{}],8:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],9:[function(require,module,exports){
const matcher = require('./matcher');

const wordyWords = [
  'a number of',
  'abundance',
  'accede to',
  'accelerate',
  'accentuate',
  'accompany',
  'accomplish',
  'accorded',
  'accrue',
  'acquiesce',
  'acquire',
  'additional',
  'adjacent to',
  'adjustment',
  'admissible',
  'advantageous',
  'adversely impact',
  'advise',
  'aforementioned',
  'aggregate',
  'aircraft',
  'all of',
  'all things considered',
  'alleviate',
  'allocate',
  'along the lines of',
  'already existing',
  'alternatively',
  'amazing',
  'ameliorate',
  'anticipate',
  'apparent',
  'appreciable',
  'as a matter of fact',
  'as a means of',
  'as far as I\'m concerned',
  'as of yet',
  'as to',
  'as yet',
  'ascertain',
  'assistance',
  'at the present time',
  'at this time',
  'attain',
  'attributable to',
  'authorize',
  'because of the fact that',
  'belated',
  'benefit from',
  'bestow',
  'by means of',
  'by virtue of the fact that',
  'by virtue of',
  'cease',
  'close proximity',
  'commence',
  'comply with',
  'concerning',
  'consequently',
  'consolidate',
  'constitutes',
  'demonstrate',
  'depart',
  'designate',
  'discontinue',
  'due to the fact that',
  'each and every',
  'economical',
  'eliminate',
  'elucidate',
  'employ',
  'endeavor',
  'enumerate',
  'equitable',
  'equivalent',
  'evaluate',
  'evidenced',
  'exclusively',
  'expedite',
  'expend',
  'expiration',
  'facilitate',
  'factual evidence',
  'feasible',
  'finalize',
  'first and foremost',
  'for all intents and purposes',
  'for the most part',
  'for the purpose of',
  'forfeit',
  'formulate',
  'have a tendency to',
  'honest truth',
  'however',
  'if and when',
  'impacted',
  'implement',
  'in a manner of speaking',
  'in a timely manner',
  'in a very real sense',
  'in accordance with',
  'in addition',
  'in all likelihood',
  'in an effort to',
  'in between',
  'in excess of',
  'in lieu of',
  'in light of the fact that',
  'in many cases',
  'in my opinion',
  'in order to',
  'in regard to',
  'in some instances',
  'in terms of',
  'in the case of ',
  'in the event that',
  'in the final analysis',
  'in the nature of',
  'in the near future',
  'in the process of',
  'inception',
  'incumbent upon',
  'indicate',
  'indication',
  'initiate',
  'irregardless',
  'is applicable to',
  'is authorized to',
  'is responsible for',
  'it is essential',
  'it is',
  'it seems that',
  'it was',
  'magnitude',
  'maximum',
  'methodology',
  'minimize',
  'minimum',
  'modify',
  'monitor',
  'multiple',
  'necessitate',
  'nevertheless',
  'not certain',
  'not many',
  'not often',
  'not unless',
  'not unlike',
  'notwithstanding',
  'null and void',
  'numerous',
  'objective',
  'obligate',
  'obtain',
  'on the contrary',
  'on the other hand',
  'one particular',
  'optimum',
  'overall',
  'owing to the fact that',
  'participate',
  'particulars',
  'pass away',
  'pertaining to',
  'point in time',
  'portion',
  'possess',
  'preclude',
  'previously',
  'prior to',
  'prioritize',
  'procure',
  'proficiency',
  'provided that',
  'purchase',
  'put simply',
  'readily apparent',
  'refer back',
  'regarding',
  'relocate',
  'remainder',
  'remuneration',
  'requirement',
  'reside',
  'residence',
  'retain',
  'satisfy',
  'shall',
  'should you wish',
  'similar to',
  'solicit',
  'span across',
  'strategize',
  'subsequent',
  'substantial',
  'successfully complete',
  'sufficient',
  'terminate',
  'the month of',
  'the point I am trying to make',
  'therefore',
  'time period',
  'took advantage of',
  'transmit',
  'transpire',
  'type of',
  'until such time as',
  'utilization',
  'utilize',
  'validate',
  'various different',
  'what I mean to say is',
  'whether or not',
  'with respect to',
  'with the exception of',
  'witnessed'
];

const wordyRegex = new RegExp(`\\b(${wordyWords.join('|')})\\b`, 'gi');

module.exports = function isTextWordy(text) {
  return matcher(wordyRegex, text);
};

},{"./matcher":8}],10:[function(require,module,exports){
var weasels = [
  'are a number',
  'clearly',
  'completely',
  'exceedingly',
  'excellent',
  'extremely',
  'fairly',
  'few',
  'huge',
  'interestingly',
  'is a number',
  'largely',
  'many',
  'mostly',
  'obviously',
  'quite',
  'relatively',
  'remarkably',
  'several',
  'significantly',
  'substantially',
  'surprisingly',
  'tiny',
  'various',
  'vast',
  'very'
];

// Allow "too many" and "too few"
var exceptions = [
  'many',
  'few'
]

var re = new RegExp('\\b(' + weasels.join('|') + ')\\b', 'gi');

module.exports = function (text, opts) {
  var suggestions = [];
  while (match = re.exec(text)) {
    var weasel = match[0].toLowerCase();
    if (exceptions.indexOf(weasel) === -1 ||
        text.substr(match.index-4, 4) !== 'too ') {
      suggestions.push({
        index: match.index,
        offset: weasel.length,
      });
    }
  }
  return suggestions;
};

},{}],11:[function(require,module,exports){
function repeatChar(ch, times) {
  let str = '';
  for (let i = times; i > 0; i--) {
    str += ch;
  }
  return str;
}

function generateStartOfLineIndex(line, lines) {
  const x = lines.slice(0);
  x.splice(line - 1);
  return x.join('\n').length + (x.length > 0);
}

function findLineColumn(contents, lines, index) {
  const line = contents.substr(0, index).split('\n').length;
  const startOfLineIndex = generateStartOfLineIndex(line, lines);
  const col = index - startOfLineIndex;

  return { line, col };
}

// annotate file contents with suggestions
module.exports = function annotate(contents, suggestions, parse) {
  const lines = contents.split('\n');

  return suggestions.map((suggestion) => {
    const lineColumn = findLineColumn(contents, lines, suggestion.index);

    let fix = 0;

    if (lineColumn.col > 25) {
      fix = lineColumn.col - 25;
    }

    if (parse) {
      return {
        reason: suggestion.reason,
        line: lineColumn.line,
        col: lineColumn.col,
      };
    }
    const lineSegment = lines[lineColumn.line - 1].substr(fix, 80);

    return [
      lineSegment,
      repeatChar(' ', lineColumn.col - fix) + repeatChar('^', suggestion.offset),
      `${suggestion.reason} on line ${lineColumn.line} at column ${lineColumn.col}`
    ].join('\n');
  });
};

},{}],12:[function(require,module,exports){
// via http://matt.might.net/articles/shell-scripts-for-passive-voice-weasel-words-duplicates/

// Example:
// Many readers are not aware that the
// the brain will automatically ignore
// a second instance of the word "the"
// when it starts a new line.
const re = new RegExp('(\\s*)([^\\s]+)', 'gi');
const word = /\w+/;

module.exports = function lexicalIllusions(text) {
  const suggestions = [];
  let lastMatch = '';
  let match;

  // eslint-disable-next-line no-cond-assign
  while (match = re.exec(text)) {
    if (word.test(match[2]) && match[2].toLowerCase() === lastMatch) {
      suggestions.push({
        index: match.index + match[1].length,
        offset: match[2].length
      });
    }
    lastMatch = match[2].toLowerCase();
  }

  return suggestions;
};

},{}],13:[function(require,module,exports){
/* eslint-disable no-cond-assign */

// Opinion: I think it's gross to start written English independent clauses with "so"
//          most of the time. Maybe it's okay in spoken English.
//
// More on "so:"
// * http://www.nytimes.com/2010/05/22/us/22iht-currents.html?_r=0
// * http://comminfo.rutgers.edu/images/comprofiler/plug_profilegallery/84/pg_2103855866.pdf

// this implementation is really naive
// eslint-disable-next-line no-control-regex
const re = new RegExp('([^\n\\.;!?]+)([\\.;!?]+)', 'gi');
const startsWithSoRegex = new RegExp('^(\\s)*so\\b[\\s\\S]', 'i');

module.exports = function startsWithSo(text) {
  const suggestions = [];
  let match;
  let innerMatch;

  while (match = re.exec(text)) {
    if (innerMatch = startsWithSoRegex.exec(match[1])) {
      suggestions.push({
        index: match.index + (innerMatch[1] || '').length,
        offset: 2
      });
    }
  }
  return suggestions;
};

},{}],14:[function(require,module,exports){
/* eslint-disable no-cond-assign */

// Opinion: I think it's gross to start written English sentences with "there (is|are)"
//          (most of the time)

// this implementation is really naive
// eslint-disable-next-line no-control-regex
const re = new RegExp('([^\n\\.;!?]+)([\\.;!?]+)', 'gi');
const startsWithThereIsRegex = new RegExp('^(\\s)*there\\b\\s(is|are)\\b', 'i');

module.exports = function startsWithThereIs(text) {
  const suggestions = [];
  let match;
  let innerMatch;

  while (match = re.exec(text)) {
    if (innerMatch = startsWithThereIsRegex.exec(match[1])) {
      suggestions.push({
        index: match.index + (innerMatch[1] || '').length,
        offset: innerMatch[0].length - (innerMatch[1] || '').length
      });
    }
  }
  return suggestions;
};

},{}],15:[function(require,module,exports){
const weaselWords = require('weasel-words');
const passiveVoice = require('passive-voice');
const adverbWhere = require('adverb-where');
const tooWordy = require('too-wordy');
const noCliches = require('no-cliches');
const ePrime = require('e-prime');

const lexicalIllusions = require('./lib/lexical-illusions');
const startsWithSo = require('./lib/starts-with-so');
const thereIs = require('./lib/there-is');

const defaultChecks = {
  weasel: { fn: weaselWords, explanation: 'is a weasel word' },
  illusion: { fn: lexicalIllusions, explanation: 'is repeated' },
  so: { fn: startsWithSo, explanation: 'adds no meaning' },
  thereIs: { fn: thereIs, explanation: 'is unnecessary verbiage' },
  passive: { fn: passiveVoice, explanation: 'may be passive voice' },
  adverb: { fn: adverbWhere, explanation: 'can weaken meaning' },
  tooWordy: { fn: tooWordy, explanation: 'is wordy or unneeded' },
  cliches: { fn: noCliches, explanation: 'is a cliche' },
  eprime: { fn: ePrime, explanation: 'is a form of \'to be\'' }
};

// User must explicitly opt-in
const disabledChecks = {
  eprime: false
};

function dedup(suggestions) {
  const dupsHash = {};

  return suggestions.reduce((memo, suggestion) => {
    const key = `${suggestion.index}:${suggestion.offset}`;
    if (!dupsHash[key]) {
      dupsHash[key] = suggestion;
      memo.push(suggestion);
    } else {
      dupsHash[key].reason += ` and ${suggestion.reason.substring(suggestion.offset + 3)}`;
    }
    return memo;
  }, []);
}

function reasonable(text, reason) {
  return function reasonableSuggestion(suggestion) {
    // eslint-disable-next-line no-param-reassign
    suggestion.reason = `"${
      text.substr(suggestion.index, suggestion.offset)
    }" ${reason}`;
    return suggestion;
  };
}

module.exports = function writeGood(text, opts = {}) {
  const finalOpts = {};
  const defaultOpts = Object.assign({}, disabledChecks, opts);
  Object.keys(defaultOpts).forEach((optKey) => {
    if (optKey !== 'checks') {
      finalOpts[optKey] = defaultOpts[optKey];
    }
  });

  const finalChecks = opts.checks || defaultChecks;

  let suggestions = [];
  Object.keys(finalChecks).forEach((checkName) => {
    if (finalOpts[checkName] !== false) {
      suggestions = suggestions.concat(
        finalChecks[checkName]
          .fn(text)
          .map(reasonable(text, finalChecks[checkName].explanation))
      );
    }
  });

  return dedup(suggestions).sort((a, b) => (a.index < b.index ? -1 : 1));
};

module.exports.annotate = require('./lib/annotate');

},{"./lib/annotate":11,"./lib/lexical-illusions":12,"./lib/starts-with-so":13,"./lib/there-is":14,"adverb-where":2,"e-prime":4,"no-cliches":5,"passive-voice":7,"too-wordy":9,"weasel-words":10}]},{},[1]);
