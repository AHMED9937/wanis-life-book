import { PrismaClient, CoverStyle } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_RESIDENTS = [
  {
    name: 'صالح العبدالله',
    nickname: 'أبو محمد',
    age: 82,
    roomNumber: '١٠٤',
    admissionDate: '٢٠٢٤/٠١/١٥',
    coverTitle: 'كتاب حياة أبو محمد',
    coverColor: 'emerald',
    stories: [
      {
        title: 'أيام الغوص واللؤلؤ في الخمسينات',
        date: '٢٠٢٤/٠٢/١٠',
        content: 'أتذكر جيداً عندما كنت في الخامسة عشرة من عمري، ركبت المحمل مع والدي وعمي متوجهين إلى الهيرات الكبيرة. كانت الحياة قاسية ولكن القلوب كانت متآلفة ومحبة. كنا نردد الأهازيج البحرية طوال الليل تحت ضوء القمر، ونقتسم حبات التمر والماء العذب. في ذلك الصيف، استخرج والدي لؤلؤة فريدة أطلق عليها "الدانة" وباعها للتجار الكبار ليشتري لنا أول بيت مبني من الجص والحجارة.',
        audioDuration: '٤:١٥',
      },
      {
        title: 'أول سيارة دخلت حارتنا القديمة',
        date: '٢٠٢٤/٠٣/٠٥',
        content: 'كان يوماً مشهوداً لا ينسى. تجمع أهل الفريج كلهم عند زاوية المسجد ليشاهدوا تلك المركبة العجيبة ذات اللون الأسود اللامع. كان صوت المحرك يهز الجدران الطينية، وكان الأطفال يركضون خلفها بفرح واندهاش. ركبنا في الصندوق الخلفي ودار بنا السائق حول السوق القديم مرتين. تلك البساطة في الفرح هي ما أفتقده اليوم.',
        audioDuration: '٢:٤٠',
      },
      {
        title: 'بناء بيتنا الطيني بأيدي الجيران',
        date: '٢٠٢٤/٠٤/٢٢',
        content: 'عندما تقرر توسعة منزلنا بعد زواج أخي الأكبر، لم نحتاج إلى استئجار عمال. في صباح يوم الجمعة، توافد الجيران وأبناء العمومة يحملون الطين والتبن وجذوع الأثل. كانت النساء يجهزن الغداء الكبير من الجريش واللحم، والأصوات تتعالى بالدعاء والبركة. بنينا ثلاثة غرف في غضون أسبوع واحد بفضل "الفزعة" والتعاون الصادق.',
        audioDuration: '٥:١٠',
      }
    ]
  },
  {
    name: 'نورة السالم',
    nickname: 'أم فهد',
    age: 78,
    roomNumber: '٢٠٢',
    admissionDate: '٢٠٢٣/١١/٠١',
    coverTitle: 'كتاب حياة أم فهد',
    coverColor: 'burgundy',
    stories: [
      {
        title: 'زواجي في ليلة مقمرة وسط الأهل',
        date: '٢٠٢٣/١٢/١٢',
        content: 'كانت ليلة الحناء مليئة بأصوات الطبول ورائحة البخور والورد المحمدي. ألبسوني الثوب الأخضر المطرز بالزري المذهب. كانت جدتي رحمها الله تمسح على رأسي وتوصيني بالصبر والمودة. مشينا في موكب صغير تحفه الفوانيس المضيئة حتى وصلنا إلى بيت زوجي. كانت القلوب نقية، والمهر بسيطاً، والبركة تملأ أركان الدار.',
        audioDuration: '٣:٥٠',
      },
      {
        title: 'ذكريات الخياطة وتطريز أثواب العيد',
        date: '٢٠٢٤/٠١/٣٠',
        content: 'كنت أمتلك ماكينة خياطة يدوية سوداء من طراز قديم، أعتبرها كنزاً ثميناً. قبل قدوم العيد بشهر، تتوافد بنات الحي وأمهاتهن لأفصل لهن الدراريع والفساتين الزاهية. كنت أسهر على ضوء السراج حتى صلاة الفجر لأكمل التطريز لكي ترتدي الفتيات ملابس جديدة يفرحن بها في صباح العيد.',
        audioDuration: '٤:٢٠',
      }
    ]
  },
  {
    name: 'إبراهيم المرزوق',
    nickname: 'الجد إبراهيم',
    age: 85,
    roomNumber: '١١٠',
    admissionDate: '٢٠٢٤/٠٣/٠٢',
    coverTitle: 'كتاب حياة الجد إبراهيم',
    coverColor: 'sapphire',
    stories: [
      {
        title: 'دكان والدي في قلب السوق القديم',
        date: '٢٠٢٤/٠٣/١٥',
        content: 'دكان والدي كان يبيع الهيل والزعفران والقهوة البرية. رائحة المكان محفورة في ذاكرتي لا تغيب. كان التجار يجتمعون عنده بعد صلاة العصر يتبادلون الأخبار ويشربون القهوة المهيلة. تعلمت من والدي الأمانة والصدق في الكيل، وكيف أن الكلمة الطيبة تفتح أبواب الرزق وتكسب احترام الناس.',
        audioDuration: '٣:١٥',
      }
    ]
  },
  {
    name: 'لطيفة الخالدي',
    nickname: 'الجدة لطيفة',
    age: 76,
    roomNumber: '٢٠٥',
    admissionDate: '٢٠٢٤/٠٥/١٠',
    coverTitle: 'كتاب حياة الجدة لطيفة',
    coverColor: 'amber',
    stories: [
      {
        title: 'رحلات الربيع وجمع الفقع في البر',
        date: '٢٠٢٤/٠٥/٢٠',
        content: 'في مواسم هطول الأمطار، كنا نخرج في قوافل صغيرة ننصب الخيام بيضاء اللون وسط الخزامى والنفل. كنا نبحث عن الفقع (الكمأة) تحت التربة الرملية بمهارة توارثناها. طعم تلك الأيام ممزوج برائحة الحطب المشتعل وحليب النوق الطازج في الصباح الباكر.',
        audioDuration: '٢:٥٥',
      }
    ]
  }
];

const mapCoverStyle = (color: string): CoverStyle => {
  if (color === 'emerald') return CoverStyle.forest_green;
  if (color === 'amber') return CoverStyle.vintage_gold;
  return CoverStyle.classic_leather;
};

const parseArabicDuration = (dur: string): number => {
  // Convert Eastern Arabic numerals to standard if needed, or just hardcode approximation for the seed
  const arabicToEnglish: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  const englishDur = dur.replace(/[٠-٩]/g, c => arabicToEnglish[c]);
  const parts = englishDur.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 180; // default 3 mins
};

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Demo care home only (not shared with real signups — see auth.ts)
  let careHome = await prisma.careHome.findFirst({ where: { name: 'Wanis Demo' } });
  if (!careHome) {
    careHome = await prisma.careHome.create({
      data: {
        name: 'Wanis Demo',
        contactNumber: '00000000',
        address: 'Sample data for demo admin only',
        setupCompleted: true,
      }
    });
    console.log('✅ Created demo care home (Wanis Demo)');
  }

  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@wanis.app' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        clerkId: 'seed_admin_clerk_id',
        role: 'admin',
        fullName: 'Wanis System Admin',
        email: 'admin@wanis.app',
        careHomeId: careHome.id,
      }
    });
    console.log('✅ Created System Admin User');
  }

  // 2. Insert INITIAL_RESIDENTS
  for (const resData of INITIAL_RESIDENTS) {
    const names = resData.name.split(' ');
    
    // Check if exists
    const existing = await prisma.resident.findFirst({
      where: { firstName: names[0], lastName: names.slice(1).join(' ') || "مجهول", careHomeId: careHome.id }
    });

    if (!existing) {
      await prisma.resident.create({
        data: {
          firstName: names[0],
          lastName: names.slice(1).join(' ') || "مجهول",
          nickname: resData.nickname,
          gender: 'male', // Defaulting for seed
          roomNumber: resData.roomNumber,
          careHomeId: careHome.id,
          // Calculate DOB from age roughly (assuming year 2024)
          dateOfBirth: new Date(2024 - resData.age, 0, 1),
          lifeBook: {
            create: {
              bookTitle: resData.coverTitle,
              coverStyle: mapCoverStyle(resData.coverColor),
              stories: {
                create: resData.stories.map(story => ({
                  title: story.title,
                  audioFileUrl: '',
                  rawTranscript: story.content,
                  literaryContent: story.content,
                  durationSeconds: parseArabicDuration(story.audioDuration),
                  recordedById: adminUser.id,
                }))
              }
            }
          }
        }
      });
      console.log(`✅ Seeded Resident: ${resData.name}`);
    } else {
      console.log(`⚠️ Skipped Resident (already exists): ${resData.name}`);
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
