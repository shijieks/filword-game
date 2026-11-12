// =====================
// ДАННЫЕ ИГРЫ
// =====================

const COIN_SVG = '<svg class="coin-ico" viewBox="0 0 24 24" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10" fill="#e8c26a" stroke="#8f6d2a" stroke-width="1"/>' +
    '<circle cx="12" cy="12" r="6.5" fill="none" stroke="#8f6d2a" stroke-width="1" opacity="0.55"/>' +
    '<text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#6b4e14" font-family="Arial,sans-serif">₽</text>' +
    '</svg>';

// =====================
// РАУНДЫ (40)
// =====================
const ROUNDS = [
    { theme: "🐾 Животные", size: 4, item: "🐘", itemName: "Слонёнок", words: ["КОТ", "ЛИСА", "СЛОН"], bonusWords: ["БЫК"], reward: 10, tutorial: true },
    { theme: "🌊 Жители моря", size: 5, item: "🐙", itemName: "Осьминог", words: ["КРАБ", "КИТ", "СКАТ"], bonusWords: ["РАК"], reward: 10 },
    { theme: "🐦 Птицы", size: 6, item: "🦜", itemName: "Попугай", words: ["СОВА", "АИСТ", "ДЯТЕЛ", "ЧАЙКА"], bonusWords: ["ЧИЖ"], reward: 10 },
    { theme: "🐛 Насекомые", size: 6, item: "🦋", itemName: "Бабочка", words: ["ОСА", "ЖУК", "ПАУК", "КОМАР"], bonusWords: ["ШМЕЛЬ"], reward: 10 },
    { theme: "🌿 Растения", size: 6, item: "🌳", itemName: "Дерево жизни", words: ["ДУБ", "РОЗА", "ЛИЛИЯ", "БЕРЕЗА"], bonusWords: ["ФИКУС"], reward: 10 },
    { theme: "🌸 Цветы", size: 7, item: "🌺", itemName: "Роза", words: ["РОЗА", "ЛИЛИЯ", "ПИОН", "АСТРА", "ИРИС"], bonusWords: ["ЛЮПИН"], reward: 10 },
    { theme: "🌲 Деревья", size: 7, item: "🌵", itemName: "Кактус", words: ["ДУБ", "КЛЕН", "СОСНА", "ЕЛЬ", "ИВА", "ТОПОЛЬ"], bonusWords: ["ОЛЬХА"], reward: 10 },
    { theme: "🍄 Грибы", size: 9, item: "🍄", itemName: "Мухомор", words: ["ЛИСИЧКА", "ОПЕНОК", "СЫРОЕЖКА", "МАСЛЕНОК", "ГРУЗДЬ", "МУХОМОР"], bonusWords: ["БОРОВИК"], reward: 10 },
    { theme: "🍓 Ягоды", size: 10, item: "🍓", itemName: "Земляника", words: ["МАЛИНА", "СМОРОДИНА", "ЧЕРНИКА", "БРУСНИКА", "ГОЛУБИКА", "КЛЮКВА"], bonusWords: ["ЕЖЕВИКА"], reward: 10 },
    { theme: "🥕 Овощи", size: 9, item: "🎃", itemName: "Тыква", words: ["ЛУК", "СВЕКЛА", "МОРКОВЬ", "КАПУСТА", "ТЫКВА", "ОГУРЕЦ", "ПЕРЕЦ"], bonusWords: ["РЕДИС"], reward: 10 },
    { theme: "🐠 Рыбы", size: 9, item: "🐡", itemName: "Рыба-ёж", words: ["КАРП", "ЩУКА", "ОКУНЬ", "СУДАК", "ЛЕЩ", "СОМ", "УГОРЬ"], bonusWords: ["КАМБАЛА"], reward: 10 },
    { theme: "🦎 Рептилии", size: 9, item: "🐍", itemName: "Змея", words: ["УЖ", "ГАДЮКА", "КОБРА", "ПИТОН", "УДАВ", "ВАРАН", "ИГУАНА"], bonusWords: ["ГЕККОН"], reward: 10 },
    { theme: "🐾 Хищники", size: 10, item: "🐆", itemName: "Гепард", words: ["ВОЛК", "ЛИСА", "РЫСЬ", "ГЕПАРД", "ПУМА", "ЛЕВ", "ТИГР"], bonusWords: ["ГИЕНА"], reward: 10 },
    { theme: "🌾 Поле", size: 10, item: "🌾", itemName: "Колос", words: ["РОЖЬ", "ПШЕНИЦА", "ОВЕС", "ЯЧМЕНЬ", "ПРОСО", "ГРЕЧИХА", "ЛЕН", "КЛЕВЕР"], bonusWords: ["ПШЕНО"], reward: 10 },
    { theme: "🍇 Фрукты", size: 10, item: "🍇", itemName: "Виноград", words: ["ГРУША", "СЛИВА", "АЙВА", "ПЕРСИК", "АБРИКОС", "ВИШНЯ", "ЯБЛОКО", "БАНАН"], bonusWords: ["ГРАНАТ"], reward: 10 },
    { theme: "🪨 Минералы", size: 10, item: "💎", itemName: "Алмаз", words: ["МЕЛ", "ГИПС", "КВАРЦ", "ГРАНИТ", "БАЗАЛЬТ", "МРАМОР", "ЯНТАРЬ", "РУБИН"], bonusWords: ["ОНИКС"], reward: 10 },
    { theme: "🌋 Стихии", size: 10, item: "🌋", itemName: "Вулкан", words: ["ОГОНЬ", "ВОДА", "ЗЕМЛЯ", "ВОЗДУХ", "ВЕТЕР", "ДОЖДЬ", "СНЕГ", "МОЛНИЯ"], bonusWords: ["ИНЕЙ"], reward: 10 },
    { theme: "🪐 Космос", size: 11, item: "🪐", itemName: "Сатурн", words: ["ЛУНА", "СОЛНЦЕ", "ЗВЕЗДА", "ПЛАНЕТА", "КОМЕТА", "МЕТЕОР", "ГАЛАКТИКА", "САТУРН", "МАРС"], bonusWords: ["АСТЕРОИД"], reward: 10 },
    { theme: "🏞️ Ландшафты", size: 11, item: "🏔️", itemName: "Гора", words: ["ГОРА", "ХОЛМ", "ДОЛИНА", "РАВНИНА", "ПЛАТО", "УЩЕЛЬЕ", "КАНЬОН", "ВУЛКАН", "ГЕЙЗЕР"], bonusWords: ["ОЗЕРО"], reward: 10 },
    { theme: "🦕 Динозавры", size: 11, item: "🦖", itemName: "Тираннозавр", words: ["ТРИЦЕРАТОПС", "СТЕГОЗАВР", "ДИПЛОДОК", "АЛЛОЗАВР", "ТИРАННОЗАВР", "АНКИЛОЗАВР", "ИХТИОЗАВР"], bonusWords: ["ПТЕРО"], reward: 10 },
    { theme: "🐚 Моллюски", size: 11, item: "🐚", itemName: "Ракушка", words: ["УЛИТКА", "СЛИЗЕНЬ", "МИДИЯ", "УСТРИЦА", "ГРЕБЕШОК", "КАЛЬМАР", "ОСЬМИНОГ", "НАУТИЛУС"], bonusWords: ["МОРСКОЙ"], reward: 10 },
    { theme: "🦀 Ракообразные", size: 11, item: "🦀", itemName: "Краб", words: ["КРАБ", "РАК", "КРЕВЕТКА", "ЛАНГУСТ", "ОМАР", "ЦИКЛОП", "ДАФНИЯ", "МОКРИЦА"], bonusWords: ["РАКУШКА"], reward: 10 },
    { theme: "🐙 Головоногие", size: 11, item: "🐙", itemName: "Осьминог", words: ["КАЛЬМАР", "ОСЬМИНОГ", "НАУТИЛУС", "КАРАКАТИЦА", "СПРУТ", "АРГОНАВТ", "ВАМПИР", "ЛОЛИГО"], bonusWords: ["ЩУПАЛЬЦЕ"], reward: 10 },
    { theme: "🦇 Рукокрылые", size: 10, item: "🦇", itemName: "Летучая мышь", words: ["МЫШЬ", "КРЫЛАН", "ВЕЧЕРНИЦА", "КОЖАН", "УШАН", "НЕТОПЫРЬ", "БУЛЬДОГ", "РЫЖИЙ"], bonusWords: ["СУСЛИК"], reward: 10 },
    { theme: "🐸 Амфибии", size: 10, item: "🐸", itemName: "Жаба", words: ["ЖАБА", "ЛЯГУШКА", "ТРИТОН", "КВАКША", "ЖЕРЛЯНКА", "АКСОЛОТЛЬ", "ПИПА", "АМБИСТОМА"], bonusWords: ["СИРЕН"], reward: 10 },
    { theme: "🌾 Злаки", size: 10, item: "🌾", itemName: "Пшеница", words: ["РОЖЬ", "ПШЕНИЦА", "ОВЕС", "ЯЧМЕНЬ", "ПРОСО", "РИС", "КУКУРУЗА", "СОРГО"], bonusWords: ["ПШЕНКА"], reward: 10 },
    { theme: "🍯 Пчёлы и мёд", size: 10, item: "🍯", itemName: "Мёд", words: ["ПЧЕЛА", "ТРУТЕНЬ", "МАТКА", "ВОСК", "ПРОПОЛИС", "ПЕРГА", "ПЫЛЬЦА", "НЕКТАР"], bonusWords: ["ПАСЕКА"], reward: 10 },
    { theme: "🦋 Бабочки", size: 10, item: "🦋", itemName: "Махаон", words: ["МАХАОН", "АДМИРАЛ", "ТРАУРНИЦА", "ЛИМОННИЦА", "ПАВЛИНИЙ", "БЕЛЯНКА", "ГОЛУБЯНКА", "ПЕСТРУШКА"], bonusWords: ["МОТЫЛЁК"], reward: 10 },
    { theme: "🌺 Тропические цветы", size: 10, item: "🌺", itemName: "Орхидея", words: ["ОРХИДЕЯ", "ГИБИСКУС", "ПАЛЬМА", "АНТУРИУМ", "ГЕЛИКОНИЯ", "ПЛУМЕРИЯ", "СТРЕЛИЦИЯ", "ЛИЛИЯ"], bonusWords: ["МАГНОЛИЯ"], reward: 10 },
    { theme: "🌵 Пустыня", size: 10, item: "🌵", itemName: "Кактус", words: ["КАКТУС", "ПЕСОК", "БАРХАН", "ОАЗИС", "ВЕРБЛЮД", "СКОРПИОН", "ЯЩЕРИЦА", "САКСАУЛ"], bonusWords: ["МИРАЖ"], reward: 10 },
    { theme: "🐧 Пингвины", size: 10, item: "🐧", itemName: "Пингвин", words: ["ПИНГВИН", "АДЕЛИ", "ГЕНТУ", "ХОХЛАТЫЙ", "ОЧКОВЫЙ", "ИМПЕРАТОР", "ПАПУА", "МАЛЫЙ"], bonusWords: ["ПТИЦА"], reward: 10 },
    { theme: "🐻 Медведи", size: 10, item: "🐻", itemName: "Бурый медведь", words: ["БУРЫЙ", "БЕЛЫЙ", "ГРИЗЛИ", "ПАНДА", "БАРИБАЛ", "ОЧКОВЫЙ", "МАЛАЙСКИЙ", "ЛЕНИВЕЦ"], bonusWords: ["МЕДВЕДЬ"], reward: 10 },
    { theme: "🦌 Олени", size: 10, item: "🦌", itemName: "Олень", words: ["ОЛЕНЬ", "ЛАНЬ", "КОСУЛЯ", "МАРАЛ", "ИЗЮБР", "ЛОСЬ", "ПУДУ", "АКСИС"], bonusWords: ["СЕРНА"], reward: 10 },
    { theme: "🐺 Волки", size: 10, item: "🐺", itemName: "Волк", words: ["ВОЛК", "ШАКАЛ", "КОЙОТ", "ДИНГО", "ПЕСЕЦ", "ЛИСИЦА", "ФЕНЕК", "МАЙКОНГ"], bonusWords: ["ВОЛКОДАВ"], reward: 10 },
    { theme: "🦊 Лисы", size: 10, item: "🦊", itemName: "Лиса", words: ["ЛИСА", "ПЕСЕЦ", "ФЕНЕК", "КОРСАК", "ШАКАЛ", "ЕНОТ", "НОСУХА", "ГРИВИСТЫЙ"], bonusWords: ["ПЕСЧАНКА"], reward: 10, snake: true },
    { theme: "🐱 Кошки", size: 10, item: "🐱", itemName: "Кошка", words: ["КОШКА", "КОТ", "ЛЕОПАРД", "ТИГР", "ЛЕВ", "РЫСЬ", "ПУМА", "ГЕПАРД"], bonusWords: ["СЕРВАЛ"], reward: 10, snake: true },
    { theme: "🐶 Собаки", size: 10, item: "🐶", itemName: "Собака", words: ["СОБАКА", "ПЕС", "ВОЛК", "ЛИСА", "ШАКАЛ", "КОЙОТ", "ДИНГО", "ПЕСЕЦ"], bonusWords: ["БОЛОНКА"], reward: 10, snake: true },
    { theme: "🐴 Лошади", size: 10, item: "🐴", itemName: "Лошадь", words: ["ЛОШАДЬ", "КОНЬ", "ПОНИ", "ОСЕЛ", "ЗЕБРА", "МУЛ", "ЛОШАК", "КУЛАН"], bonusWords: ["АРАБСКАЯ"], reward: 10 },
    { theme: "🐮 Коровы", size: 10, item: "🐮", itemName: "Корова", words: ["КОРОВА", "БЫК", "ТЕЛЕНОК", "БУЙВОЛ", "ЗУБР", "БИЗОН", "ЯК", "ГАЯЛ"], bonusWords: ["ТУР"], reward: 10 },
    { theme: "🐷 Свиньи", size: 10, item: "🐷", itemName: "Свинья", words: ["СВИНЬЯ", "ХРЯК", "ПОРОСЕНОК", "КАБАН", "ПЕКАРИ", "БАБИРУСА", "КИСТЕУХА", "ДИКИЙ"], bonusWords: ["ПЯТАЧОК"], reward: 10 },
];

// =====================
// РАНГИ
// =====================
const RANKS = [
    { id: "bronze", name: "Бронза", level: 10, plateLevels: [10, 20, 30] },
    { id: "silver", name: "Серебро", level: 40, plateLevels: [40, 50, 60] },
    { id: "palladium", name: "Палладий", level: 80, plateLevels: [80, 90, 100] },
    { id: "gold", name: "Золото", level: 120, plateLevels: [120, 130, 140] },
    { id: "platinum", name: "Платина", level: 150, plateLevels: [150, 160, 170] },
    { id: "diamond", name: "Алмаз", level: 190, plateLevels: [190, 200, 210] },
];

// =====================
// ТИРЫ КАРТОЧЕК
// =====================
const TIERS = [
    { id: "t1", name: "Обычная", minLevel: 1, css: "t1" },
    { id: "t2", name: "Редкая", minLevel: 10, css: "t2" },
    { id: "t3", name: "Легендарная", minLevel: 20, css: "t3" },
    { id: "t4", name: "Эпическая", minLevel: 40, css: "t4" },
    { id: "t5", name: "Мифическая", minLevel: 70, css: "t5" },
    { id: "t6", name: "Секретная", minLevel: 100, css: "t6" },
];

// =====================
// КАРТОЧКИ (96 = 6 тиров × 16)
// =====================
const CARDS = [
    // ===== t1 — Обычные (16) =====
    { id: "c1_1", name: "Мышь", tier: "t1", ico: ["images/cards/mouse_1.png", "images/cards/mouse_2.png", "images/cards/mouse_3.png", "images/cards/mouse_4.png", "images/cards/mouse_5.png", "images/cards/mouse_6.png"], fact: "Мыши живут около 2 лет. Они едят зерно, семена и насекомых." },
    { id: "c1_2", name: "Заяц", tier: "t1", ico: ["images/cards/hare_1.png", "images/cards/hare_2.png", "images/cards/hare_3.png", "images/cards/hare_4.png", "images/cards/hare_5.png", "images/cards/hare_6.png"], fact: "Зайцы могут развивать скорость до 70 км/ч. Они едят траву и кору." },
    { id: "c1_3", name: "Рыба", tier: "t1", ico: ["images/cards/fish_1.png", "images/cards/fish_2.png", "images/cards/fish_3.png", "images/cards/fish_4.png", "images/cards/fish_5.png", "images/cards/fish_6.png"], fact: "Рыбы дышат жабрами. Тело большинства рыб покрыто чешуёй." },
    { id: "c1_4", name: "Лягушка", tier: "t1", ico: ["images/cards/frog_1.png", "images/cards/frog_2.png", "images/cards/frog_3.png", "images/cards/frog_4.png", "images/cards/frog_5.png", "images/cards/frog_6.png"], fact: "Лягушки дышат лёгкими и кожей. Кожа должна быть влажной, чтобы участвовать в дыхании." },
    { id: "c1_5", name: "Сверчок", tier: "t1", ico: ["images/cards/cricket_1.png", "images/cards/cricket_2.png", "images/cards/cricket_3.png", "images/cards/cricket_4.png", "images/cards/cricket_5.png", "images/cards/cricket_6.png"], fact: "Сверчки — насекомые. Они стрекочут, потирая крылья друг о друга." },
    { id: "c1_6", name: "Улитка", tier: "t1", ico: ["images/cards/snail_1.png", "images/cards/snail_2.png", "images/cards/snail_3.png", "images/cards/snail_4.png", "images/cards/snail_5.png", "images/cards/snail_6.png"], fact: "У улитки есть твёрдая раковина для защиты. На концах её щупалец расположены крошечные глазки." },
    { id: "c1_7", name: "Росток", tier: "t1", ico: ["images/cards/sprout_1.png", "images/cards/sprout_2.png", "images/cards/sprout_3.png", "images/cards/sprout_4.png", "images/cards/sprout_5.png", "images/cards/sprout_6.png"], fact: "Росток появляется из семени. Он тянется к солнцу и растёт вверх." },
    { id: "c1_8", name: "Яблоко", tier: "t1", ico: ["images/cards/apple_1.png", "images/cards/apple_2.png", "images/cards/apple_3.png", "images/cards/apple_4.png", "images/cards/apple_5.png", "images/cards/apple_6.png"], fact: "Яблоко — это фрукт. Оно растёт на яблоне и содержит витамины." },
    { id: "c1_9", name: "Курица", tier: "t1", ico: ["images/cards/chicken_1.png", "images/cards/chicken_2.png", "images/cards/chicken_3.png", "images/cards/chicken_4.png", "images/cards/chicken_5.png", "images/cards/chicken_6.png"], fact: "Куры были одомашнены позднее многих других животных. Они всеядны." },
    { id: "c1_10", name: "Свинья", tier: "t1", ico: ["images/cards/pig_1.png", "images/cards/pig_2.png", "images/cards/pig_3.png", "images/cards/pig_4.png", "images/cards/pig_5.png", "images/cards/pig_6.png"], fact: "Свиньи очень умны — занимают 4-е место среди самых умных животных после шимпанзе, дельфинов и слонов." },
    { id: "c1_11", name: "Овца", tier: "t1", ico: ["images/cards/sheep_1.png", "images/cards/sheep_2.png", "images/cards/sheep_3.png", "images/cards/sheep_4.png", "images/cards/sheep_5.png", "images/cards/sheep_6.png"], fact: "У овец очень острый слух. Они боятся резких звуков." },
    { id: "c1_12", name: "Утка", tier: "t1", ico: ["images/cards/duck_1.png", "images/cards/duck_2.png", "images/cards/duck_3.png", "images/cards/duck_4.png", "images/cards/duck_5.png", "images/cards/duck_6.png"], fact: "Крякать умеют только самки уток. Селезни крякать не могут." },
    { id: "c1_13", name: "Кукуруза", tier: "t1", ico: ["images/cards/corn_1.png", "images/cards/corn_2.png", "images/cards/corn_3.png", "images/cards/corn_4.png", "images/cards/corn_5.png", "images/cards/corn_6.png"], fact: "Кукуруза — это злак. Она растёт на поле и используется в еде." },
    { id: "c1_14", name: "Морковь", tier: "t1", ico: ["images/cards/carrot_1.png", "images/cards/carrot_2.png", "images/cards/carrot_3.png", "images/cards/carrot_4.png", "images/cards/carrot_5.png", "images/cards/carrot_6.png"], fact: "Морковь — это овощ. Она растёт в земле и богата витамином A." },
    { id: "c1_15", name: "Хлеб", tier: "t1", ico: ["images/cards/bread_1.png", "images/cards/bread_2.png", "images/cards/bread_3.png", "images/cards/bread_4.png", "images/cards/bread_5.png", "images/cards/bread_6.png"], fact: "Хлеб пекут из муки. Он бывает белый и чёрный." },
    { id: "c1_16", name: "Капля", tier: "t1", ico: ["images/cards/drop_1.png", "images/cards/drop_2.png", "images/cards/drop_3.png", "images/cards/drop_4.png", "images/cards/drop_5.png", "images/cards/drop_6.png"], fact: "Капля воды — это жидкость. Она нужна всем живым существам." },

    // ===== t2 — Редкие (16) =====
    { id: "c2_1", name: "Лиса", tier: "t2", ico: ["images/cards/fox_1.png", "images/cards/fox_2.png", "images/cards/fox_3.png", "images/cards/fox_4.png", "images/cards/fox_5.png", "images/cards/fox_6.png"], fact: "Лиса — хищник. Она ест мышей и птиц, живёт в норе." },
    { id: "c2_2", name: "Орёл", tier: "t2", ico: ["images/cards/eagle_1.png", "images/cards/eagle_2.png", "images/cards/eagle_3.png", "images/cards/eagle_4.png", "images/cards/eagle_5.png", "images/cards/eagle_6.png"], fact: "Орёл — хищная птица. Он видит добычу с высоты и живёт в горах." },
    { id: "c2_3", name: "Волк", tier: "t2", ico: ["images/cards/wolf_1.png", "images/cards/wolf_2.png", "images/cards/wolf_3.png", "images/cards/wolf_4.png", "images/cards/wolf_5.png", "images/cards/wolf_6.png"], fact: "Волк — хищник. Он живёт в стае и ест мясо." },
    { id: "c2_4", name: "Олень", tier: "t2", ico: ["images/cards/deer_1.png", "images/cards/deer_2.png", "images/cards/deer_3.png", "images/cards/deer_4.png", "images/cards/deer_5.png", "images/cards/deer_6.png"], fact: "Олень — травоядное. У него есть рога, он живёт в лесу." },
    { id: "c2_5", name: "Черепаха", tier: "t2", ico: ["images/cards/turtle_1.png", "images/cards/turtle_2.png", "images/cards/turtle_3.png", "images/cards/turtle_4.png", "images/cards/turtle_5.png", "images/cards/turtle_6.png"], fact: "Черепаха живёт в панцире. Она ест траву и может жить очень долго." },
    { id: "c2_6", name: "Ёж", tier: "t2", ico: ["images/cards/hedgehog_1.png", "images/cards/hedgehog_2.png", "images/cards/hedgehog_3.png", "images/cards/hedgehog_4.png", "images/cards/hedgehog_5.png", "images/cards/hedgehog_6.png"], fact: "Ёж сворачивается в клубок. Он ест насекомых и живёт в лесу." },
    { id: "c2_7", name: "Цветок", tier: "t2", ico: ["images/cards/flower_1.png", "images/cards/flower_2.png", "images/cards/flower_3.png", "images/cards/flower_4.png", "images/cards/flower_5.png", "images/cards/flower_6.png"], fact: "Цветок — это растение. Он растёт из семени и пахнет." },
    { id: "c2_8", name: "Гриб", tier: "t2", ico: ["images/cards/mushroom_1.png", "images/cards/mushroom_2.png", "images/cards/mushroom_3.png", "images/cards/mushroom_4.png", "images/cards/mushroom_5.png", "images/cards/mushroom_6.png"], fact: "Гриб — это не растение. Он растёт в лесу и бывает съедобным." },
    { id: "c2_9", name: "Бобр", tier: "t2", ico: ["images/cards/beaver_1.png", "images/cards/beaver_2.png", "images/cards/beaver_3.png", "images/cards/beaver_4.png", "images/cards/beaver_5.png", "images/cards/beaver_6.png"], fact: "Бобр строит плотины. Он ест кору и живёт у воды." },
    { id: "c2_10", name: "Барсук", tier: "t2", ico: ["images/cards/badger_1.png", "images/cards/badger_2.png", "images/cards/badger_3.png", "images/cards/badger_4.png", "images/cards/badger_5.png", "images/cards/badger_6.png"], fact: "Барсук живёт в норе. Он ест насекомых и живёт в лесу." },
    { id: "c2_11", name: "Белка", tier: "t2", ico: ["images/cards/squirrel_1.png", "images/cards/squirrel_2.png", "images/cards/squirrel_3.png", "images/cards/squirrel_4.png", "images/cards/squirrel_5.png", "images/cards/squirrel_6.png"], fact: "Белка живёт на дереве. Она ест орехи и грибы." },
    { id: "c2_12", name: "Летучая мышь", tier: "t2", ico: ["images/cards/bat_1.png", "images/cards/bat_2.png", "images/cards/bat_3.png", "images/cards/bat_4.png", "images/cards/bat_5.png", "images/cards/bat_6.png"], fact: "Летучая мышь спит днём. Она летает ночью и ест насекомых." },
    { id: "c2_13", name: "Перо", tier: "t2", ico: ["images/cards/feather_1.png", "images/cards/feather_2.png", "images/cards/feather_3.png", "images/cards/feather_4.png", "images/cards/feather_5.png", "images/cards/feather_6.png"], fact: "Перо — это часть птицы. Оно помогает летать." },
    { id: "c2_14", name: "Колос", tier: "t2", ico: ["images/cards/wheat_1.png", "images/cards/wheat_2.png", "images/cards/wheat_3.png", "images/cards/wheat_4.png", "images/cards/wheat_5.png", "images/cards/wheat_6.png"], fact: "Колос — это часть злака. Он даёт зерно." },
    { id: "c2_15", name: "Клён", tier: "t2", ico: ["images/cards/maple_1.png", "images/cards/maple_2.png", "images/cards/maple_3.png", "images/cards/maple_4.png", "images/cards/maple_5.png", "images/cards/maple_6.png"], fact: "Клён — это дерево. У него резные листья и крылатые семена." },
    { id: "c2_16", name: "Жёлудь", tier: "t2", ico: ["images/cards/acorn_1.png", "images/cards/acorn_2.png", "images/cards/acorn_3.png", "images/cards/acorn_4.png", "images/cards/acorn_5.png", "images/cards/acorn_6.png"], fact: "Жёлудь — это плод дуба. Он растёт на дереве." },

    // ===== t3 — Легендарные (16) =====
    { id: "c3_1", name: "Лев", tier: "t3", ico: ["images/cards/lion_1.png", "images/cards/lion_2.png", "images/cards/lion_3.png", "images/cards/lion_4.png", "images/cards/lion_5.png", "images/cards/lion_6.png"], fact: "Лев — царь зверей. Он живёт в саванне и ест мясо." },
    { id: "c3_2", name: "Тигр", tier: "t3", ico: ["images/cards/tiger_1.png", "images/cards/tiger_2.png", "images/cards/tiger_3.png", "images/cards/tiger_4.png", "images/cards/tiger_5.png", "images/cards/tiger_6.png"], fact: "Тигр — самый крупный кот. Он живёт в лесу и ест мясо." },
    { id: "c3_3", name: "Павлин", tier: "t3", ico: ["images/cards/peacock_1.png", "images/cards/peacock_2.png", "images/cards/peacock_3.png", "images/cards/peacock_4.png", "images/cards/peacock_5.png", "images/cards/peacock_6.png"], fact: "Павлин раскрывает хвост. Он живёт в лесу и ест зёрна." },
    { id: "c3_4", name: "Сова", tier: "t3", ico: ["images/cards/owl_1.png", "images/cards/owl_2.png", "images/cards/owl_3.png", "images/cards/owl_4.png", "images/cards/owl_5.png", "images/cards/owl_6.png"], fact: "Сова летает ночью. Она ест мышей и живёт в дупле." },
    { id: "c3_5", name: "Дельфин", tier: "t3", ico: ["images/cards/dolphin_1.png", "images/cards/dolphin_2.png", "images/cards/dolphin_3.png", "images/cards/dolphin_4.png", "images/cards/dolphin_5.png", "images/cards/dolphin_6.png"], fact: "Дельфин — умное животное. Он живёт в море и ест рыбу." },
    { id: "c3_6", name: "Бабочка", tier: "t3", ico: ["images/cards/butterfly_1.png", "images/cards/butterfly_2.png", "images/cards/butterfly_3.png", "images/cards/butterfly_4.png", "images/cards/butterfly_5.png", "images/cards/butterfly_6.png"], fact: "Бабочки пробуют вкус пищи при помощи задних лапок." },
    { id: "c3_7", name: "Кактус", tier: "t3", ico: ["images/cards/cactus_1.png", "images/cards/cactus_2.png", "images/cards/cactus_3.png", "images/cards/cactus_4.png", "images/cards/cactus_5.png", "images/cards/cactus_6.png"], fact: "Кактус растёт в пустыне. Он запасает воду в стебле." },
    { id: "c3_8", name: "Подсолнух", tier: "t3", ico: ["images/cards/sunflower_1.png", "images/cards/sunflower_2.png", "images/cards/sunflower_3.png", "images/cards/sunflower_4.png", "images/cards/sunflower_5.png", "images/cards/sunflower_6.png"], fact: "Подсолнух поворачивается к солнцу. Из его семян делают масло." },
    { id: "c3_9", name: "Слон", tier: "t3", ico: ["images/cards/elephant_1.png", "images/cards/elephant_2.png", "images/cards/elephant_3.png", "images/cards/elephant_4.png", "images/cards/elephant_5.png", "images/cards/elephant_6.png"], fact: "Слон — самое крупное наземное животное. Он живёт в саванне и ест траву." },
    { id: "c3_10", name: "Жираф", tier: "t3", ico: ["images/cards/giraffe_1.png", "images/cards/giraffe_2.png", "images/cards/giraffe_3.png", "images/cards/giraffe_4.png", "images/cards/giraffe_5.png", "images/cards/giraffe_6.png"], fact: "Жираф — самое высокое животное. Он ест листья с деревьев." },
    { id: "c3_11", name: "Зебра", tier: "t3", ico: ["images/cards/zebra_1.png", "images/cards/zebra_2.png", "images/cards/zebra_3.png", "images/cards/zebra_4.png", "images/cards/zebra_5.png", "images/cards/zebra_6.png"], fact: "Зебра — полосатая лошадь. Она живёт в саванне и ест траву." },
    { id: "c3_12", name: "Горилла", tier: "t3", ico: ["images/cards/gorilla_1.png", "images/cards/gorilla_2.png", "images/cards/gorilla_3.png", "images/cards/gorilla_4.png", "images/cards/gorilla_5.png", "images/cards/gorilla_6.png"], fact: "Горилла — крупная обезьяна. Она живёт в лесу и ест растения." },
    { id: "c3_13", name: "Носорог", tier: "t3", ico: ["images/cards/rhino_1.png", "images/cards/rhino_2.png", "images/cards/rhino_3.png", "images/cards/rhino_4.png", "images/cards/rhino_5.png", "images/cards/rhino_6.png"], fact: "Носорог имеет рог на носу. Он живёт в саванне и ест траву." },
    { id: "c3_14", name: "Крокодил", tier: "t3", ico: ["images/cards/crocodile_1.png", "images/cards/crocodile_2.png", "images/cards/crocodile_3.png", "images/cards/crocodile_4.png", "images/cards/crocodile_5.png", "images/cards/crocodile_6.png"], fact: "Крокодил — хищник. Он живёт у воды и ест мясо." },
    { id: "c3_15", name: "Акула", tier: "t3", ico: ["images/cards/shark_1.png", "images/cards/shark_2.png", "images/cards/shark_3.png", "images/cards/shark_4.png", "images/cards/shark_5.png", "images/cards/shark_6.png"], fact: "Акула — хищная рыба. Она живёт в море и ест рыбу." },
    { id: "c3_16", name: "Кит", tier: "t3", ico: ["images/cards/whale_1.png", "images/cards/whale_2.png", "images/cards/whale_3.png", "images/cards/whale_4.png", "images/cards/whale_5.png", "images/cards/whale_6.png"], fact: "Кит — самое крупное животное на планете. Он живёт в море и ест планктон." },

    // ===== t4 — Эпические (16) =====
    { id: "c4_1", ico: "🦄", name: "Единорог", tier: "t4" },
    { id: "c4_2", ico: "🐉", name: "Дракон", tier: "t4" },
    { id: "c4_3", ico: "🦅", name: "Грифон", tier: "t4" },
    { id: "c4_4", ico: "🦂", name: "Скорпион", tier: "t4" },
    { id: "c4_5", ico: "🐙", name: "Кракен", tier: "t4" },
    { id: "c4_6", ico: "🔮", name: "Магия", tier: "t4" },
    { id: "c4_7", ico: "🌊", name: "Волна", tier: "t4" },
    { id: "c4_8", ico: "⚡", name: "Молния", tier: "t4" },
    { id: "c4_9", ico: "🦇", name: "Вампир", tier: "t4" },
    { id: "c4_10", ico: "🐺", name: "Оборотень", tier: "t4" },
    { id: "c4_11", ico: "🧙", name: "Маг", tier: "t4" },
    { id: "c4_12", ico: "🏹", name: "Лучник", tier: "t4" },
    { id: "c4_13", ico: "🛡️", name: "Щит", tier: "t4" },
    { id: "c4_14", ico: "⚔️", name: "Меч", tier: "t4" },
    { id: "c4_15", ico: "🗡️", name: "Кинжал", tier: "t4" },
    { id: "c4_16", ico: "🏰", name: "Замок", tier: "t4" },

    // ===== t5 — Мифические (16) =====
    { id: "c5_1", ico: "🔱", name: "Тритон", tier: "t5" },
    { id: "c5_2", ico: "👑", name: "Корона", tier: "t5" },
    { id: "c5_3", ico: "🦁", name: "Сфинкс", tier: "t5" },
    { id: "c5_4", ico: "🐲", name: "Великий змей", tier: "t5" },
    { id: "c5_5", ico: "🦋", name: "Фея", tier: "t5" },
    { id: "c5_6", ico: "🌟", name: "Звезда", tier: "t5" },
    { id: "c5_7", ico: "🔥", name: "Феникс", tier: "t5" },
    { id: "c5_8", ico: "💠", name: "Кристалл", tier: "t5" },
    { id: "c5_9", ico: "🧜", name: "Русалка", tier: "t5" },
    { id: "c5_10", ico: "🧚", name: "Дух", tier: "t5" },
    { id: "c5_11", ico: "🦌", name: "Керинейская лань", tier: "t5" },
    { id: "c5_12", ico: "🐎", name: "Пегас", tier: "t5" },
    { id: "c5_13", ico: "🦂", name: "Мантикора", tier: "t5" },
    { id: "c5_14", ico: "🐍", name: "Василиск", tier: "t5" },
    { id: "c5_15", ico: "🕷️", name: "Арахна", tier: "t5" },
    { id: "c5_16", ico: "🌙", name: "Луна", tier: "t5" },

    // ===== t6 — Секретные (16) =====
    { id: "c6_1", ico: "👁️", name: "Око", tier: "t6" },
    { id: "c6_2", ico: "🧿", name: "Амулет", tier: "t6" },
    { id: "c6_3", ico: "🌌", name: "Галактика", tier: "t6" },
    { id: "c6_4", ico: "🕳️", name: "Чёрная дыра", tier: "t6" },
    { id: "c6_5", ico: "👽", name: "Пришелец", tier: "t6" },
    { id: "c6_6", ico: "🛸", name: "НЛО", tier: "t6" },
    { id: "c6_7", ico: "🌠", name: "Комета", tier: "t6" },
    { id: "c6_8", ico: "💫", name: "Созвездие", tier: "t6" },
    { id: "c6_9", ico: "🌍", name: "Планета", tier: "t6" },
    { id: "c6_10", ico: "☄️", name: "Метеор", tier: "t6" },
    { id: "c6_11", ico: "🪐", name: "Сатурн", tier: "t6" },
    { id: "c6_12", ico: "⭐", name: "Сверхновая", tier: "t6" },
    { id: "c6_13", ico: "🌀", name: "Портал", tier: "t6" },
    { id: "c6_14", ico: "🔮", name: "Оракул", tier: "t6" },
    { id: "c6_15", ico: "👑", name: "Владыка", tier: "t6" },
    { id: "c6_16", ico: "🌑", name: "Затмение", tier: "t6" },
];

// =====================
// МАГАЗИН
// =====================
const SHOP = [
    { id: "hint", ico: "💡", name: "Подсказка", desc: "Подсветит одно слово", price: 5, type: "hint", count: 1 },
    { id: "gender", ico: "🎭", name: "Сменить пол", desc: "Сменить образ", price: 20, type: "gender" },
    { id: "pet", ico: "🐾", name: "Сменить питомца", desc: "Выбрать другого питомца", price: 50, type: "pet" },
    { id: "skip", ico: "⚡", name: "Пропуск раунда", desc: "Открыть следующий раунд", price: 50, type: "skip" },
    { id: "chest", ico: "🎁", name: "Сундук с картой", desc: "Случайная карта по уровню", price: 80, type: "chest", count: 1 },
    { id: "petFood", ico: "🍖", name: "Еда для питомца", desc: "+1 запас еды", price: 20, type: "petFood", count: 1 },
    { id: "petToy", ico: "🎾", name: "Игрушка", desc: "+1 запас игрушек", price: 15, type: "petToy", count: 1 },
];

// =====================
// ПИТОМЦЫ (объект, не массив!)
// ico — 6 стадий эволюции
// =====================
const PETS = {
    cat: {
        id: "cat", name: "Кот", emoji: "🐱",
        ico: [
            "images/pets/cat_1.png", "images/pets/cat_2.png", "images/pets/cat_3.png",
            "images/pets/cat_4.png", "images/pets/cat_5.png", "images/pets/cat_6.png"
        ],
        desc: "Ласковый и мурлычет"
    },
    dog: {
        id: "dog", name: "Пёс", emoji: "🐶",
        ico: [
            "images/pets/dog_1.png", "images/pets/dog_2.png", "images/pets/dog_3.png",
            "images/pets/dog_4.png", "images/pets/dog_5.png", "images/pets/dog_6.png"
        ],
        desc: "Верный и активный"
    },
    dragon: {
        id: "dragon", name: "Дракончик", emoji: "🐉",
        ico: [
            "images/pets/dragon_1.png", "images/pets/dragon_2.png", "images/pets/dragon_3.png",
            "images/pets/dragon_4.png", "images/pets/dragon_5.png", "images/pets/dragon_6.png"
        ],
        desc: "Экзотический и магический"
    }
};

// =====================
// ЕДА И ИГРУШКИ ДЛЯ ПИТОМЦА
// =====================
const PET_FOOD = ["🍎", "🍖", "🥕", "🍞", "🐟"];
const PET_TOYS = ["🎾", "🧶", "🪀", "🎁", "🪁"];

// =====================
// ЕЖЕДНЕВНЫЕ НАГРАДЫ (7 дней)
// coins / hints / chests / card
// =====================
const DAILY_REWARDS = [
    { coins: 10, ico: "💰", label: "10 монет" },
    { coins: 20, ico: "💰", label: "20 монет" },
    { coins: 30, ico: "💰", label: "30 монет" },
    { card: 1, ico: "🎴", label: "Карточка" },
    { coins: 100, ico: "💰", label: "100 монет" },
    { card: 1, ico: "🌟", label: "Карточка" },
    { card: 1, ico: "💠", label: "Карточка" },
];

// =====================
// КАЛЕНДАРЬ НАГРАД (28 дней)
// coins / hints / chests / card
// =====================
const CALENDAR_REWARDS = [
    { coins: 10, ico: "💰", label: "10 монет" },
    { coins: 15, ico: "💰", label: "15 монет" },
    { coins: 20, ico: "💰", label: "20 монет" },
    { coins: 25, ico: "💰", label: "25 монет" },
    { coins: 30, ico: "💰", label: "30 монет" },
    { coins: 40, ico: "💰", label: "40 монет" },
    { card: 1, ico: "🎴", label: "Карточка" },
    { coins: 20, ico: "💰", label: "20 монет" },
    { coins: 25, ico: "💰", label: "25 монет" },
    { coins: 30, ico: "💰", label: "30 монет" },
    { coins: 40, ico: "💰", label: "40 монет" },
    { coins: 50, ico: "💰", label: "50 монет" },
    { coins: 60, ico: "💰", label: "60 монет" },
    { chests: 1, ico: "🎁", label: "Сундук" },
    { coins: 30, ico: "💰", label: "30 монет" },
    { coins: 40, ico: "💰", label: "40 монет" },
    { coins: 50, ico: "💰", label: "50 монет" },
    { coins: 60, ico: "💰", label: "60 монет" },
    { coins: 70, ico: "💰", label: "70 монет" },
    { coins: 80, ico: "💰", label: "80 монет" },
    { card: 1, ico: "🌟", label: "Карточка" },
    { coins: 40, ico: "💰", label: "40 монет" },
    { coins: 50, ico: "💰", label: "50 монет" },
    { coins: 60, ico: "💰", label: "60 монет" },
    { coins: 70, ico: "💰", label: "70 монет" },
    { coins: 80, ico: "💰", label: "80 монет" },
    { coins: 100, ico: "💰", label: "100 монет" },
    { chests: 1, ico: "💠", label: "Сундук" },
];

// =====================
// ЕЖЕНЕДЕЛЬНЫЙ КВЕСТ
// =====================
const WEEKLY_QUEST = {
    target: 100,
    reward: "chest",
    desc: "Найди 100 слов за неделю",
    text: "Найди 100 слов за неделю"
};

// =====================
// ЕЖЕДНЕВНЫЕ КВЕСТЫ (name, а не text!)
// =====================
const QUEST_POOL = [
    { id: "q_words_10", type: "words", target: 10, reward: 25, name: "Найди 10 слов" },
    { id: "q_words_15", type: "words", target: 15, reward: 35, name: "Найди 15 слов" },
    { id: "q_words_25", type: "words", target: 25, reward: 50, name: "Найди 25 слов" },
    { id: "q_rounds_2", type: "rounds", target: 2, reward: 30, name: "Пройди 2 раунда" },
    { id: "q_rounds_3", type: "rounds", target: 3, reward: 45, name: "Пройди 3 раунда" },
    { id: "q_frags_6", type: "frags", target: 6, reward: 25, name: "Собери 6 фрагментов" },
    { id: "q_frags_10", type: "frags", target: 10, reward: 40, name: "Собери 10 фрагментов" },
    { id: "q_chest_1", type: "chests", target: 1, reward: 50, name: "Открой 1 сундук" },
    { id: "q_daily_1", type: "daily", target: 1, reward: 20, name: "Забери ежедневный бонус" },
    { id: "q_nohint_1", type: "noHint", target: 1, reward: 60, name: "Пройди раунд без подсказок" },
    { id: "q_themes_2", type: "themes", target: 2, reward: 30, name: "Пройди 2 разные темы" },
];