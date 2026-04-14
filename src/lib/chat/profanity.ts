// ─── Profanity Filter ─────────────────────────────────────────
export const profanityList: Set<string> = new Set([
  // Türkçe argo/küfür
  'amına', 'amını', 'amina', 'aminakoyim', 'amk', 'aq', 'a.q', 'siktir', 'siktirgit', 'siktir et', 'siktir oğlu', 'siktir amcık', 'siktirgit', 'siktirip', 'siktirici',
  'orospu', 'orosbu', 'orospu çocuğu', 'orospu çocukları', 'orospuyu', 'orosbuya', 'orosbuyu', 'orospu evladı', 'orospu yavşağı', 'orospu herifi', 'orospu artığı',
  'piç', 'pıç', 'pic', 'p.i.ç', 'piçi', 'piçler', 'piçlik', 'piço', 'piçler', 'bastard', 'bastards',
  'yarak', 'yaraklık', 'yaragim', 'yaragın', 'yarrak', 'yarraklık', 'yarragim', 'yarragin',
  'göt', 'got', 'götsün', 'gotsun', 'götün', 'gotun', 'götveren', 'gotveren', 'göt veren', 'got veren', 'götvereni', 'gotvereni', 'götlek', 'gotlek', 'götçük', 'gotcuk',
  'mal', 'mal gibi', 'malın', 'malın oğlu', 'mal-evladı',
  'şerefsiz', 'serefsiz', 'şerefsizce', 'serefsizce', 'şerefsizin', 'serefsizin', 'şerefsizler', 'serefsizler',
  'hıyar', 'hiyar', 'hyar', 'hıyara', 'hiyara', 'hıyarlar', 'hiyarlar', 'hıyarlık', 'hiyarlık',
  'şmük', 'smuk', 'şimşek', 'şimşuk', 'şimşük', 'şmük',
  'sülale', 'sülalenin', 'sülalemi', 'sülalenin yarrakları',
  'taşak', 'taşaklık', 'tasaklık', 'task', 'tasklık',
  'çomar', 'çomarı', 'çomarlar', 'çomar gibi',
  'kropla', 'kıro', 'kıroğlu', 'kıroydu', 'kırolar',
  'şerefsiz', 'serefsiz', 'şerefiz', 'şerefsız',
  'götler', 'gotler', 'götlük', 'gotluk',
  'bok', 'boklu', 'bokluk', 'boku', 'boke', 'bokcular', 'bokcu', 'bokçular', 'bokçu',
  'bepad', 'bepede', 'beped', 'b.e.p', 'b e p',
  'sie', 'sıe',
  'aşağı', 'asagi', 'aşagı', 'aşagi',
  'ağa', 'aga', 'ağanın', 'aganın',
  'sikeyim', 'sike', 'siktiğim', 'sikildi', 'sikil', 'sikerim', 'sikesim', 'sikeyim', 'sikem', 'sikim', 'sikiyim',
  'siker', 'sikersin', 'sikti', 'siktim', 'siktir', 'siktirgit', 'sikilir', 'sikilmiş', 'sikme', 'sikmeden',
  'siktir', 'siktirgit', 'siktirip', 'siktirerek', 'siktirir', 'siktirsin', 'siktirsinler',
  'sikim', 'sikimdim', 'siken', 'sikile', 'sikilme', 'sikimci',
  'am', 'amcık', 'amcıgım', 'amcığım', 'amciğim', 'amcim', 'amcigim', 'amcik', 'amcikar', 'amci', 'amcı', 'amciim', 'amcıım', 'amq', 'amque', 'amına', 'amini', 'amin', 'aminak', 'aminakoy', 'aminakoyim', 'amına koy', 'amına koyim', 'amına koyuyim', 'amınaq', 'amına qoy', 'amına qoyim', 'amınakoyim', 'amınaqoyim', 'amınakoyum', 'amınaqoyum',
  'annana', 'anana', 'ananı', 'ananın', 'anani', 'ananisin', 'ananın amı', 'ananı sikeyim', 'ananı sikerim', 'anana sikeyim', 'anani sikeyim',
  'oç', 'oc', 'oçlar', 'oclar', 'oçsun', 'ocsun', 'oçsuphi', 'oçsupi', 'oçsif', 'oçsefil', 'oçsuz', 'ocsuz',
  'çük', 'cuk', 'çükü', 'çükün', 'çükler', 'cukler', 'çüklik', 'cukluk',
  'pezevenk', 'pezeven', 'pezeveng', 'pezevengi', 'pezevenkler', 'pezevenkevladı', 'pazevenk', 'pazeveng', 'pazevenk',
  'hassiktir', 'hassiktirip', 'hassiktirmek', 'has siktir', 'hassiktir',
  'serefsizlik', 'şerefsizlik',
  'götverenlik', 'gotverenlik',
  'yarraklık', 'yaraklık',
  'taşaklık', 'tasaklık',
  // Türkçe leetspeak (4=m/a, 1=i, 0=o, 5=s, 7=t, 3=e, @=a)
  '4mk', '4m.k', '@mk', '@m.k', '4mck', 'amck', 'a.m.k',
  's1kt1r', 's1ktir', 'sikt1r', '5iktir', '5ikt1r', '$iktir', '$1kt1r', 's1k71r', 's1k7ir', 'sik7ir',
  '0ruspu', 'or0spu', '0rosbu', 'or0sbu',
  'p1ç', 'p!ç', 'p1c', 'p!c', 'pïc',
  'g0t', 'gö7', 'go7', 'g07',
  'y4r4k', 'y@r@k', 'y4r@k', 'y@r4k', 'y4r7k', 'y@r7k',
  'b0k', 'bök', 'b0k',
  'h1yar', 'h!yar', 'h1ar', 'h!ar',
  'oç', '0ç', '0c', 'öç',
  'çük', 'c0k', 'ç0k', 'cük',
  'şeref5iz', 'ş3r3f5iz',
  // İngilizce profanity
  'fuck', 'fucking', 'fucked', 'fuckyou', 'fuckoff', 'fuckin', 'fucker', 'fuckers', 'fuckup', 'fuckwit', 'fuk', 'fukc', 'fuker', 'fukin', 'fuking', 'fukkin', 'fukk', 'fuq', 'phuck', 'phuq', 'fuc', 'fux', 'fuxk',
  'shit', 'shitty', 'shithead', 'shitbag', 'shits', 'shitat', 'shitface', 'shitter', 'shitting', 'shitted', 'shit hole', 'shitass', 'shitspam', 'shit stain', 'bullshit',
  'bitch', 'bitches', 'bitchy', 'bitching', 'bitchin', 'bitchslap', 'bitchslapped', 'bitchslapping', 'bitchlet', 'bitchtits', 'bitchute', 'biatch', 'beotch',
  'ass', 'asshole', 'assholes', 'asswipe', 'assbag', 'assbags', 'assbandit', 'assbang', 'assbanged', 'assbanging', 'assbite', 'assblaster', 'assclown', 'asscock', 'asscow', 'asses', 'assface', 'assfuck', 'assfucker', 'assgoblin', 'asshat', 'asshead', 'asshopper', 'assjacker', 'asslick', 'asslicker', 'asslover', 'assman', 'assmaster', 'assmonkey', 'assmucus', 'assmunch', 'assmuncher', 'assnigger', 'asspirate', 'asspussy', 'assranger', 'assreaper', 'assrider', 'dumbass', 'dumbasses', 'smartass', 'badass', 'jackass', 'jackasses',
  'bastard', 'bastards', 'bastardize', 'bastardized', 'bastardly', 'bastardy', 'sbastard', 'baztard',
  'dick', 'dicks', 'dickhead', 'dickheads', 'dickweed', 'dickweeds', 'dickbag', 'dickbags', 'dickbitch', 'dickface', 'dickhole', 'dickholes', 'dickhungry', 'dickie', 'dickies', 'dickish', 'dickjuice', 'dickless', 'dicklick', 'dicklicker', 'dickman', 'dickmaster', 'dickmilk', 'dicknigger', 'dicknipple', 'dicknob', 'dicknoses', 'dickquake', 'dickripper', 'dicksass', 'dickshed', 'dickslap', 'dickslapping', 'dick-smoke', 'dicksmoker', 'dicksnot', 'dicksown', 'dicksucker', 'dicksucking', 'dickwad', 'dickwads', 'dickwang', 'dickwank', 'dickwanker', 'dickweasel', 'dickweed', 'dickweeds', 'dickwet', 'dickzipper',
  'cock', 'cocks', 'cockhead', 'cockheads', 'cockface', 'cockknocker', 'cockmaster', 'cockmongler', 'cockmunch', 'cockmuncher', 'cocknose', 'cocknugget', 'cocksman', 'cocksmaster', 'cocksmith', 'cocksmoker', 'cocksniffer', 'cocksucker', 'cocksucking', 'cocktease', 'cockteaser', 'cockwaffle', 'cockwomb',
  'pussy', 'pussies', 'pusssy', 'pusy', 'pussylips', 'pussyeating', 'pussyfucker', 'pussylicker', 'pussypounder', 'pussys', 'pussylover', 'pussymouth', 'pussypicker', 'pussee', 'pussay',
  'cunt', 'cunts', 'cuntface', 'cunthead', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cuntman', 'cuntshit', 'cuntslut', 'cuntsucker',
  'whore', 'whores', 'whoreface', 'whorehouse', 'whoreing', 'whorejump', 'whores', 'whoring',
  'slut', 'sluts', 'slutty', 'slutt', 'slutting', 'slutwear', 'slutwhore', 'slutwife', 'slutz',
  'nigga', 'niggas', 'niggaz', 'nigger', 'niggers', 'niggah', 'nigguh', 'niggu', 'niggaa', 'niggger', 'nigggger', 'nigglet', 'nigglett',
  'nigger', 'niggers', 'niggerfucker', 'niggerhead', 'niggerhole', 'nigers',
  'retard', 'retards', 'retarded', 'retardness', 'tard',
  'dumb', 'dumbass', 'dumbasses', 'dumbassery', 'dumbfuck', 'dumbfucks', 'dumbest', 'dumbfuck', 'dumbfucker',
  'faggot', 'faggots', 'fagot', 'fagots', 'fagotty', 'faggit',
  'gay', 'gays', 'gayboy', 'gaygirl', 'gayism', 'gaykik', 'gayness', 'gayz',
  'scum', 'scumbag', 'scumbags',
  'moron', 'morons', 'moronic', 'moroncy', 'moronia', 'moronicly',
  'idiot', 'idiots', 'idiotic', 'idiotcy', 'idiotness', 'idiotus',
  'loser', 'losers', 'loserz',
  'jerk', 'jerks', 'jerkoff',
  'sucker', 'suckers', 'suck',
  'pathetic', 'pathetically',
  'trash', 'trashy',
  'vile', 'vileness',
  'despicable', 'despicably',
  'scumbag', 'scumbags',
  'prick', 'pricks', 'prickteaser', 'prickteasers', 'pricker',
  'slag', 'slags',
  'spunk', 'spunker', 'spunkers',
  'twat', 'twats', 'twatface', 'twatlips', 'twatting',
  'crap', 'crapola', 'crapper', 'crappers', 'crapton', 'crappy',
  'damn', 'damned', 'dammit',
  'hell', 'hellish', 'helluva',
  'bloody', 'bloodyhell',
  // İngilizce leetspeak
  'f4ck', 'f**k', 'f*ck', 'fvcK', 'fvck',
  'sh1t', 'sh*t', '$hit', '5hit', 'sh!t', 'sh7',
  'b1tch', 'b*tch', 'b!tch', 'b!7ch', 'bich',
  '@ss', '@$$', 'azz',
  'd1ck', 'd*ck', 'd!ck', 'd1cK', 'dik',
  'n1gg3r', 'n*gger', 'nigg4', 'nigg@', 'n!gger', 'nibba',
]);

// Leetspeak normalizasyonu için harf eşlemeleri
const leetMap: Record<string, string> = {
  '4': 'a', '@': 'a',
  '1': 'i', '!': 'i',
  '0': 'o',
  '3': 'e',
  '5': 's', '$': 's',
  '7': 't',
  '9': 'g',
  '8': 'b',
  '|': 'l',
};

function normalizeLeet(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(char => leetMap[char] || char)
    .join('');
}

export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[^a-z0-9çğıöşü\s]/gi, '');
  const words = normalized.split(/\s+/);

  // Leetspeak normalize edilmiş hali de kontrol et
  const normalizedLeet = normalizeLeet(text);
  const leetWords = normalizedLeet.split(/\s+/);

  for (const word of [...words, ...leetWords]) {
    if (profanityList.has(word)) {
      return true;
    }
    // Partial matching for compound words
    for (const profanity of profanityList) {
      if (word.includes(profanity) && profanity.length > 3) {
        return true;
      }
    }
  }

  return false;
}
