import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

const CITIES = [
  'Adana',
  'Adıyaman',
  'Afyonkarahisar',
  'Ağrı',
  'Amasya',
  'Ankara',
  'Antalya',
  'Artvin',
  'Aydın',
  'Balıkesir',
  'Bilecik',
  'Bingöl',
  'Bitlis',
  'Bolu',
  'Burdur',
  'Bursa',
  'Çanakkale',
  'Çankırı',
  'Çorum',
  'Denizli',
  'Diyarbakır',
  'Edirne',
  'Elazığ',
  'Erzincan',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'Giresun',
  'Gümüşhane',
  'Hakkari',
  'Hatay',
  'Isparta',
  'Mersin',
  'İstanbul',
  'İzmir',
  'Kars',
  'Kastamonu',
  'Kayseri',
  'Kırklareli',
  'Kırşehir',
  'Kocaeli',
  'Konya',
  'Kütahya',
  'Malatya',
  'Manisa',
  'Kahramanmaraş',
  'Mardin',
  'Muğla',
  'Muş',
  'Nevşehir',
  'Niğde',
  'Ordu',
  'Rize',
  'Sakarya',
  'Samsun',
  'Siirt',
  'Sinop',
  'Sivas',
  'Tekirdağ',
  'Tokat',
  'Trabzon',
  'Tunceli',
  'Şanlıurfa',
  'Uşak',
  'Van',
  'Yozgat',
  'Zonguldak',
  'Aksaray',
  'Bayburt',
  'Karaman',
  'Kırıkkale',
  'Batman',
  'Şırnak',
  'Bartın',
  'Ardahan',
  'Iğdır',
  'Yalova',
  'Karabük',
  'Kilis',
  'Osmaniye',
  'Düzce',
];

const GROUP_TAGS = [
  // Motorcycle Types
  'Touring',
  'Cafe Racer',
  'Cruiser',
  'Sport',
  'Adventure',
  'Naked',
  'Custom',
  'Vintage',
  'Electric',

  // Rider Experience Levels
  'Beginner',
  'Intermediate',
  'Advanced',

  // Riding Patterns
  'Weekend Rider',
  'Daily Commuter',
  'Long Distance',
  'Urban Rider',

  // Special Interests
  'Mechanics',
  'Customization',
  'Restoration',

  // Events
  'Meetup',
];

async function main() {
  // Seed cities
  console.log('Seeding cities...');
  const existingCities = await prisma.city.findMany();

  // Only seed if no cities exist
  if (existingCities.length === 0) {
    const cityEntries = CITIES.map((value) => ({
      value,
    }));

    for (const cityEntry of cityEntries) {
      await prisma.city.create({
        data: {
          value: cityEntry.value,
        },
      });
    }
    console.log(`Created ${cityEntries.length} cities`);
  } else {
    console.log(`Cities already exist, skipping seeding`);
  }

  // Seed group tags
  console.log('Seeding group tags...');
  const existingGroupTags = await prisma.groupTag.findMany();

  // Only seed if no group tags exist
  if (existingGroupTags.length === 0) {
    for (const tagValue of GROUP_TAGS) {
      await prisma.groupTag.create({
        data: {
          value: tagValue,
        },
      });
    }
    console.log(`Created ${GROUP_TAGS.length} group tags`);
  } else {
    console.log(`Group tags already exist, skipping seeding`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
