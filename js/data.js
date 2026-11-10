/*
  всё, что нужно менять под настоящую точку, лежит в этом файле:
  контакты, часы, условия доставки, меню и цены.
  сейчас здесь стоят примерные данные — замени их на реальные.
*/

const CONFIG = {
  name: 'Шаурма Ашота',
  city: 'Астана',
  address: 'пр. Туран, 00',            // настоящий адрес
  landmark: 'вход со стороны парковки', // ориентир, можно оставить пустым
  phone: '+7 700 000 00 00',            // телефон для звонков
  whatsapp: '77000000000',              // номер whatsapp только цифрами, с 7 в начале
  instagram: '',                        // ссылка на instagram, пусто — кнопка не показывается
  twoGis: 'https://2gis.kz/astana/search/%D0%A8%D0%B0%D1%83%D1%80%D0%BC%D0%B0%20%D0%90%D1%88%D0%BE%D1%82%D0%B0',

  // координаты для карты (сейчас — центр астаны, без метки)
  map: { lat: 51.1282, lon: 71.4306, zoom: 13, pin: false },

  // часы работы по времени астаны, close меньше open значит «до ночи следующего дня»
  hours: { open: '10:00', close: '02:00' },
  timeZone: 'Asia/Almaty',

  delivery: {
    fee: 700,            // стоимость доставки, ₸
    freeFrom: 7000,      // бесплатно от этой суммы
    minOrder: 3000,      // минимальный заказ на доставку
    time: '30–50 минут',
    pickupTime: '10–15 минут',
    pickupDiscount: 10,  // скидка на самовывоз, %
  },
};

const CATEGORIES = [
  { id: 'shawarma', title: 'Шаурма', note: 'Заворачиваем в лаваш и обжариваем на гриле перед подачей.' },
  { id: 'plate', title: 'На тарелке', note: 'То же мясо с вертела, только с гарниром и без лаваша.' },
  { id: 'snacks', title: 'Закуски', note: '' },
  { id: 'drinks', title: 'Напитки', note: '' },
  { id: 'sauces', title: 'Соусы', note: 'Делаем сами каждое утро. Порция 40 г.' },
];

/*
  tags: hit — хит, hot — острое, veg — без мяса, new — новинка
  variants: размеры или порции, у каждой своя цена
*/
const MENU = [
  // шаурма
  { id: 'classic', cat: 'shawarma', name: 'Классическая', tags: ['hit'],
    desc: 'Курица с вертела, огурец, помидор, капуста, чесночный соус.',
    variants: [{ label: '350 г', price: 1900 }, { label: '500 г', price: 2500 }] },
  { id: 'ashot', cat: 'shawarma', name: 'Острая от Ашота', tags: ['hit', 'hot'],
    desc: 'Курица, халапеньо, маринованный лук, помидор, фирменный острый соус.',
    variants: [{ label: '350 г', price: 2100 }, { label: '500 г', price: 2700 }] },
  { id: 'cheese', cat: 'shawarma', name: 'Сырная', tags: [],
    desc: 'Курица, моцарелла и чеддер, огурец, помидор, сырный соус.',
    variants: [{ label: '350 г', price: 2200 }, { label: '500 г', price: 2800 }] },
  { id: 'beef', cat: 'shawarma', name: 'Говяжья', tags: [],
    desc: 'Говядина с вертела, маринованный огурец, красный лук, соус барбекю.',
    variants: [{ label: '350 г', price: 2600 }, { label: '500 г', price: 3300 }] },
  { id: 'mix', cat: 'shawarma', name: 'Микс', tags: [],
    desc: 'Курица и говядина пополам, свежие овощи, чесночный и острый соус.',
    variants: [{ label: '350 г', price: 2400 }, { label: '500 г', price: 3100 }] },
  { id: 'fries-in', cat: 'shawarma', name: 'С картошкой фри', tags: [],
    desc: 'Курица, картофель фри внутри, огурец, капуста, чесночный соус.',
    variants: [{ label: '350 г', price: 2100 }, { label: '500 г', price: 2700 }] },
  { id: 'mushroom', cat: 'shawarma', name: 'Грибная', tags: ['new'],
    desc: 'Курица, жареные шампиньоны, сыр, сливочно-чесночный соус.',
    variants: [{ label: '350 г', price: 2300 }, { label: '500 г', price: 2900 }] },
  { id: 'falafel', cat: 'shawarma', name: 'С фалафелем', tags: ['veg'],
    desc: 'Фалафель из нута, хумус, огурец, помидор, зелень, соус тахини.',
    variants: [{ label: '350 г', price: 1900 }, { label: '500 г', price: 2500 }] },
  { id: 'kids', cat: 'shawarma', name: 'Детская', tags: [],
    desc: 'Маленькая, с курицей и сыром, без лука и острого.',
    variants: [{ label: '200 г', price: 1300 }] },

  // на тарелке
  { id: 'plate-chicken', cat: 'plate', name: 'Шаурма на тарелке', tags: ['hit'],
    desc: 'Мясо с вертела, картофель фри, свежий салат, лаваш и два соуса на выбор.',
    variants: [{ label: 'курица, 400 г', price: 2700 }, { label: 'говядина, 400 г', price: 3200 }] },
  { id: 'doner', cat: 'plate', name: 'Донер в лепёшке', tags: [],
    desc: 'Курица, помидор, огурец, красный лук и чесночный соус в горячей лепёшке.',
    variants: [{ label: '300 г', price: 2000 }] },
  { id: 'box', cat: 'plate', name: 'Бокс Ашота', tags: [],
    desc: 'Двойная порция курицы, фри, маринованные овощи, чесночный и острый соус.',
    variants: [{ label: '450 г', price: 2900 }] },

  // закуски
  { id: 'fries', cat: 'snacks', name: 'Картофель фри', tags: ['veg'],
    desc: 'Хрустящий, с солью. Соус берите отдельно.',
    variants: [{ label: '150 г', price: 800 }, { label: '250 г', price: 1200 }] },
  { id: 'nuggets', cat: 'snacks', name: 'Наггетсы', tags: [],
    desc: 'Из куриного филе в хрустящей панировке.',
    variants: [{ label: '6 шт', price: 1300 }, { label: '9 шт', price: 1800 }] },
  { id: 'cheese-sticks', cat: 'snacks', name: 'Сырные палочки', tags: ['veg'],
    desc: 'Моцарелла в панировке, тянется как надо.',
    variants: [{ label: '5 шт', price: 1500 }] },
  { id: 'onion-rings', cat: 'snacks', name: 'Луковые кольца', tags: ['veg'],
    desc: 'В кляре, жарим под заказ.',
    variants: [{ label: '8 шт', price: 1100 }] },
  { id: 'salad', cat: 'snacks', name: 'Свежий салат', tags: ['veg'],
    desc: 'Огурец, помидор, капуста, зелень, масло и лимон.',
    variants: [{ label: '200 г', price: 1000 }] },

  // напитки
  { id: 'ayran', cat: 'drinks', name: 'Айран', tags: [],
    desc: 'Холодный, слегка солёный. Лучшее к острому.',
    variants: [{ label: '0,3 л', price: 500 }] },
  { id: 'mors', cat: 'drinks', name: 'Морс облепиховый', tags: [],
    desc: 'Варим сами.',
    variants: [{ label: '0,4 л', price: 700 }] },
  { id: 'kompot', cat: 'drinks', name: 'Компот из сухофруктов', tags: [],
    desc: 'Как в детстве.',
    variants: [{ label: '0,4 л', price: 500 }] },
  { id: 'tea', cat: 'drinks', name: 'Чай', tags: [],
    desc: 'Чёрный или зелёный, с лимоном по желанию.',
    variants: [{ label: '0,4 л', price: 400 }] },
  { id: 'cola', cat: 'drinks', name: 'Газировка', tags: [],
    desc: 'Кола, спрайт или фанта.',
    variants: [{ label: '0,5 л', price: 600 }] },
  { id: 'water', cat: 'drinks', name: 'Вода', tags: [],
    desc: 'С газом или без.',
    variants: [{ label: '0,5 л', price: 300 }] },

  // соусы
  { id: 's-garlic', cat: 'sauces', name: 'Чесночный', tags: [], desc: '', variants: [{ label: '40 г', price: 200 }] },
  { id: 's-hot', cat: 'sauces', name: 'Острый', tags: ['hot'], desc: '', variants: [{ label: '40 г', price: 200 }] },
  { id: 's-cheese', cat: 'sauces', name: 'Сырный', tags: [], desc: '', variants: [{ label: '40 г', price: 200 }] },
  { id: 's-bbq', cat: 'sauces', name: 'Барбекю', tags: [], desc: '', variants: [{ label: '40 г', price: 200 }] },
  { id: 's-tahini', cat: 'sauces', name: 'Тахини', tags: ['veg'], desc: '', variants: [{ label: '40 г', price: 200 }] },
];

/* конструктор «собери свою» */
const BUILDER = {
  size: [
    { id: 'm', name: 'Обычная', hint: '350 г', price: 0 },
    { id: 'l', name: 'Большая', hint: '500 г', price: 600 },
  ],
  filling: [
    { id: 'chicken', name: 'Курица', price: 1900 },
    { id: 'beef', name: 'Говядина', price: 2600 },
    { id: 'mix', name: 'Курица и говядина', price: 2400 },
    { id: 'falafel', name: 'Фалафель', price: 1900 },
  ],
  lavash: [
    { id: 'plain', name: 'Классический', price: 0 },
    { id: 'cheese', name: 'Сырный', price: 200 },
    { id: 'tomato', name: 'Томатный', price: 150 },
  ],
  sauce: [
    { id: 'garlic', name: 'Чесночный', price: 0 },
    { id: 'hot', name: 'Острый', price: 0 },
    { id: 'cheese', name: 'Сырный', price: 0 },
    { id: 'bbq', name: 'Барбекю', price: 0 },
    { id: 'tahini', name: 'Тахини', price: 0 },
  ],
  extras: [
    { id: 'meat', name: 'Двойное мясо', price: 800 },
    { id: 'cheese', name: 'Сыр', price: 300 },
    { id: 'fries', name: 'Картофель фри', price: 250 },
    { id: 'mushroom', name: 'Шампиньоны', price: 300 },
    { id: 'jalapeno', name: 'Халапеньо', price: 200 },
    { id: 'pickles', name: 'Маринованные огурцы', price: 150 },
  ],
  without: [
    { id: 'onion', name: 'Без лука' },
    { id: 'tomato', name: 'Без помидоров' },
    { id: 'cabbage', name: 'Без капусты' },
  ],
};

const FAQ = [
  { q: 'Куда вы доставляете?',
    a: 'По всей Астане. На левый и правый берег везём сами, время зависит от пробок и погоды: обычно 30–50 минут.' },
  { q: 'Как оплатить заказ?',
    a: 'Наличными, переводом на Kaspi или картой при получении. Способ оплаты выбираете в корзине.' },
  { q: 'Можно заказать заранее, ко времени?',
    a: 'Да. В корзине выберите удобное время, и мы приготовим шаурму прямо к нему, чтобы она приехала горячей.' },
  { q: 'Можно убрать лук или добавить мяса?',
    a: 'Конечно. Соберите шаурму в конструкторе или напишите пожелание в комментарии к заказу.' },
  { q: 'Вы принимаете заказы ночью?',
    a: 'Работаем каждый день с 10:00 до 02:00. Если мы закрыты, заказ можно оформить заранее на время после открытия.' },
  { q: 'Готовите на большую компанию?',
    a: 'Да, от 10 штук лучше предупредить за час. Позвоните или напишите в WhatsApp, обсудим скидку.' },
];
