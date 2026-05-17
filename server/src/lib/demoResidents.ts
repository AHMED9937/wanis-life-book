import { CoverStyle, type PrismaClient } from "@prisma/client";

/** Starter library — explains the app (one private copy per account). */
export const DEMO_RESIDENTS_TEMPLATE = [
  {
    name: "صالح العبدالله",
    nickname: "أبو محمد",
    age: 82,
    roomNumber: "١٠٤",
    coverTitle: "كتاب حياة أبو محمد",
    coverColor: "emerald" as const,
    stories: [
      {
        title: "أيام الغوص واللؤلؤ في الخمسينات",
        content:
          'أتذكر جيداً عندما كنت في الخامسة عشرة من عمري، ركبت المحمل مع والدي وعمي متوجهين إلى الهيرات الكبيرة. كانت الحياة قاسية ولكن القلوب كانت متآلفة ومحبة. كنا نردد الأهازيج البحرية طوال الليل تحت ضوء القمر، ونقتسم حبات التمر والماء العذب. في ذلك الصيف، استخرج والدي لؤلؤة فريدة أطلق عليها "الدانة" وباعها للتجار الكبار ليشتري لنا أول بيت مبني من الجص والحجارة.',
        durationSeconds: 255,
      },
      {
        title: "أول سيارة دخلت حارتنا القديمة",
        content:
          "كان يوماً مشهوداً لا ينسى. تجمع أهل الفريج كلهم عند زاوية المسجد ليشاهدوا تلك المركبة العجيبة ذات اللون الأسود اللامع. كان صوت المحرك يهز الجدران الطينية، وكان الأطفال يركضون خلفها بفرح واندهاش. ركبنا في الصندوق الخلفي ودار بنا السائق حول السوق القديم مرتين. تلك البساطة في الفرح هي ما أفتقده اليوم.",
        durationSeconds: 160,
      },
      {
        title: "بناء بيتنا الطيني بأيدي الجيران",
        content:
          'عندما تقرر توسعة منزلنا بعد زواج أخي الأكبر، لم نحتاج إلى استئجار عمال. في صباح يوم الجمعة، توافد الجيران وأبناء العمومة يحملون الطين والتبن وجذوع الأثل. كانت النساء يجهزن الغداء الكبير من الجريش واللحم، والأصوات تتعالى بالدعاء والبركة. بنينا ثلاثة غرف في غضون أسبوع واحد بفضل "الفزعة" والتعاون الصادق.',
        durationSeconds: 310,
      },
    ],
  },
  {
    name: "نورة السالم",
    nickname: "أم فهد",
    age: 78,
    roomNumber: "٢٠٢",
    coverTitle: "كتاب حياة أم فهد",
    coverColor: "burgundy" as const,
    stories: [
      {
        title: "زواجي في ليلة مقمرة وسط الأهل",
        content:
          "كانت ليلة الحناء مليئة بأصوات الطبول ورائحة البخور والورد المحمدي. ألبسوني الثوب الأخضر المطرز بالزري المذهب. كانت جدتي رحمها الله تمسح على رأسي وتوصيني بالصبر والمودة. مشينا في موكب صغير تحفه الفوانيس المضيئة حتى وصلنا إلى بيت زوجي. كانت القلوب نقية، والمهر بسيطاً، والبركة تملأ أركان الدار.",
        durationSeconds: 230,
      },
      {
        title: "ذكريات الخياطة وتطريز أثواب العيد",
        content:
          "كنت أمتلك ماكينة خياطة يدوية سوداء من طراز قديم، أعتبرها كنزاً ثميناً. قبل قدوم العيد بشهر، تتوافد بنات الحي وأمهاتهن لأفصل لهن الدراريع والفساتين الزاهية. كنت أسهر على ضوء السراج حتى صلاة الفجر لأكمل التطريز لكي ترتدي الفتيات ملابس جديدة يفرحن بها في صباح العيد.",
        durationSeconds: 260,
      },
    ],
  },
  {
    name: "إبراهيم المرزوق",
    nickname: "الجد إبراهيم",
    age: 85,
    roomNumber: "١١٠",
    coverTitle: "كتاب حياة الجد إبراهيم",
    coverColor: "sapphire" as const,
    stories: [
      {
        title: "دكان والدي في قلب السوق القديم",
        content:
          "دكان والدي كان يبيع الهيل والزعفران والقهوة البرية. رائحة المكان محفورة في ذاكرتي لا تغيب. كان التجار يجتمعون عنده بعد صلاة العصر يتبادلون الأخبار ويشربون القهوة المهيلة. تعلمت من والدي الأمانة والصدق في الكيل، وكيف أن الكلمة الطيبة تفتح أبواب الرزق وتكسب احترام الناس.",
        durationSeconds: 195,
      },
    ],
  },
  {
    name: "لطيفة الخالدي",
    nickname: "الجدة لطيفة",
    age: 76,
    roomNumber: "٢٠٥",
    coverTitle: "كتاب حياة الجدة لطيفة",
    coverColor: "amber" as const,
    stories: [
      {
        title: "رحلات الربيع وجمع الفقع في البر",
        content:
          "في مواسم هطول الأمطار، كنا نخرج في قوافل صغيرة ننصب الخيام بيضاء اللون وسط الخزامى والنفل. كنا نبحث عن الفقع (الكمأة) تحت التربة الرملية بمهارة توارثناها. طعم تلك الأيام ممزوج برائحة الحطب المشتعل وحليب النوق الطازج في الصباح الباكر.",
        durationSeconds: 175,
      },
    ],
  },
] as const;

function mapCoverStyle(color: string): CoverStyle {
  if (color === "emerald") return CoverStyle.forest_green;
  if (color === "amber") return CoverStyle.vintage_gold;
  return CoverStyle.classic_leather;
}

/** Copy starter demo books into a care home (private per user). */
export async function seedDemoLibraryForCareHome(
  prisma: PrismaClient,
  careHomeId: string,
  recordedByUserId: string,
): Promise<number> {
  const existing = await prisma.resident.count({ where: { careHomeId } });
  if (existing > 0) {
    return 0;
  }

  let created = 0;

  for (const resData of DEMO_RESIDENTS_TEMPLATE) {
    const names = resData.name.split(" ");
    const firstName = names[0] ?? "مجهول";
    const lastName = names.slice(1).join(" ") || "مجهول";

    await prisma.resident.create({
      data: {
        firstName,
        lastName,
        nickname: resData.nickname,
        gender: "male",
        roomNumber: resData.roomNumber,
        careHomeId,
        createdById: recordedByUserId,
        dateOfBirth: new Date(new Date().getFullYear() - resData.age, 0, 1),
        lifeBook: {
          create: {
            bookTitle: resData.coverTitle,
            coverStyle: mapCoverStyle(resData.coverColor),
            stories: {
              create: resData.stories.map((story) => ({
                title: story.title,
                audioFileUrl: "",
                rawTranscript: story.content,
                literaryContent: story.content,
                durationSeconds: story.durationSeconds,
                recordedById: recordedByUserId,
              })),
            },
          },
        },
      },
    });
    created += 1;
  }

  return created;
}
