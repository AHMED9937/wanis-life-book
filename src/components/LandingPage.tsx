import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import {
  BookOpen,
  ChevronDown,
  Headphones,
  Library,
  Lock,
  Mic,
  Printer,
  Search,
  Shield,
  Sparkles,
  UserPlus,
  Volume2,
  Heart,
  Layers,
  PenLine,
  GraduationCap,
  Users,
} from 'lucide-react';
import { WanisLogo, WanisLogoMark } from './WanisLogo';

const TEAM_CREATORS = [
  'صفيه محمد',
  'روينا العبدالرحيم',
  'دانه العبيدان',
  'جوانا السعوي',
  'لينا وليد',
  'داليا الخميس',
  'ريتاج النومسي',
] as const;

const TEAM_SUPERVISOR = 'أسماء الفايزي';

const DEMO_BOOKS = [
  { name: 'صالح العبدالله', title: 'كتاب حياة أبو محمد', color: 'from-[#1b382b] to-[#0d2118] border-[#2c523f]' },
  { name: 'نورة السالم', title: 'كتاب حياة أم فهد', color: 'from-[#4a1515] to-[#2d0b0b] border-[#6e2222]' },
  { name: 'إبراهيم المرزوق', title: 'كتاب حياة الجد إبراهيم', color: 'from-[#152b4a] to-[#0b172d] border-[#254673]' },
  { name: 'لطيفة الخالدي', title: 'كتاب حياة الجدة لطيفة', color: 'from-[#5e3a0d] to-[#361e04] border-[#8a5717]' },
] as const;

const FEATURES = [
  {
    icon: Library,
    title: 'مكتبة حكايات الدار',
    desc: 'كل نزيل له كتاب حياة على الرف — غلاف فاخر، فهرس فصول، وبحث فوري بالاسم أو الكنية أو رقم الغرفة.',
  },
  {
    icon: Mic,
    title: 'تسجيل شفهي بالعربية',
    desc: 'الميكروفون الذهبي يحوّل كلام كبار السن إلى نص عربي مباشرة — ثم تحريره وحفظه كفصل جديد.',
  },
  {
    icon: Volume2,
    title: 'استماع بصوت عربي',
    desc: 'زر التشغيل يقرأ الحكاية بصوت زريّة العصري — مريح للنزيل وللعائلة وللفريق.',
  },
  {
    icon: Printer,
    title: 'طباعة كتاب كامل',
    desc: 'اطبع كل الفصول دفعة واحدة بتنسيق أنيق — حدود ذهبية وخط أميري كبير للقراءة الورقية.',
  },
  {
    icon: Search,
    title: 'بحث ذكي',
    desc: 'ابحث بأرقام عربية أو إنجليزية (١٠٤ أو 104)، بعنوان الكتاب، أو بأي جزء من الاسم.',
  },
  {
    icon: Lock,
    title: 'خصوصية كل دار',
    desc: 'كل حساب له دار رعاية مستقلة — لا يرى أحد نزلاءك أو حكاياتك. مصادقة آمنة عبر Clerk.',
  },
] as const;

const STEPS = [
  { n: '١', title: 'أنشئ حسابك', desc: 'سجّل دخولك وسمِّ دارك — تحصل فوراً على ٤ كتب نموذجية لتجربة التطبيق.' },
  { n: '٢', title: 'أضف نزيلاً أو افتح نموذجاً', desc: 'من المكتبة: كتاب جديد بغلاف ولون، أو استكشف كتب صالح ونورة وإبراهيم ولطيفة النموذجية.' },
  { n: '٣', title: 'سجّل ووثّق', desc: 'افتح الفهرس → الميكروفون → احكِ الذكريات → راجع النص → احفظ الفصل.' },
  { n: '٤', title: 'شارك واطبع', desc: 'اقرأ بصوت عالٍ، اطبع الكتاب للعائلة، واحفظ تراث الدار للأجيال.' },
] as const;

const JOURNEY = [
  { label: 'المكتبة', icon: Library },
  { label: 'الغلاف', icon: BookOpen },
  { label: 'الفهرس', icon: Layers },
  { label: 'التسجيل', icon: Mic },
  { label: 'الحكاية', icon: PenLine },
  { label: 'الطباعة', icon: Printer },
] as const;

function AuthButtons({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const pad = size === 'lg' ? 'px-8 py-3.5 text-base' : 'px-5 py-2.5 text-sm';
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
      <SignUpButton mode="modal">
        <button
          type="button"
          className={`${pad} w-full sm:w-auto rounded-full bg-gradient-to-r from-[#c9a84c] to-[#a08131] hover:from-[#e3c778] hover:to-[#c9a84c] text-[#1c120a] font-bold shadow-lg shadow-[#c9a84c]/25 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] font-cairo`}
        >
          ابدأ مجاناً — إنشاء حساب
        </button>
      </SignUpButton>
      <SignInButton mode="modal">
        <button
          type="button"
          className={`${pad} w-full sm:w-auto rounded-full bg-[#3a2010]/80 hover:bg-[#4d2a15] text-[#f4ecd8] font-semibold border border-[#c9a84c]/40 cursor-pointer transition-all font-cairo backdrop-blur-sm`}
        >
          لدي حساب — تسجيل الدخول
        </button>
      </SignInButton>
    </div>
  );
}

function MiniBook({
  title,
  subtitle,
  gradient,
  className = '',
  style,
}: {
  title: string;
  subtitle: string;
  gradient: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative aspect-[3/4] w-28 sm:w-32 rounded-r-2xl rounded-l-sm bg-gradient-to-br ${gradient} border-r-[10px] shadow-2xl p-3 flex flex-col justify-end text-center overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute inset-2 border border-[#c9a84c]/50 rounded-r-xl pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
      <p className="relative z-10 text-[9px] text-[#e3c778] font-mono tracking-wide">LIFE BOOK</p>
      <p className="relative z-10 text-xs font-amiri font-bold text-[#f4ecd8] leading-tight mt-1">{title}</p>
      <p className="relative z-10 text-[10px] text-[#c9a84c]/90 mt-0.5 font-cairo">{subtitle}</p>
    </div>
  );
}

export function LandingPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="wood-desk min-h-screen text-[#f4ecd8] overflow-x-hidden" dir="rtl">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#c9a84c]/8 blur-3xl landing-pulse" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#1b382b]/40 blur-3xl landing-pulse landing-pulse-delay" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#c9a84c]/20 bg-[#1c120a]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <WanisLogo
            size={40}
            variant="full"
            tagline="لرعاية كبار السن"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <div className="hidden md:flex items-center gap-6 text-sm font-cairo text-[#e8ddc4]/90">
            <button type="button" onClick={() => scrollTo('features')} className="hover:text-[#c9a84c] transition-colors cursor-pointer">
              المميزات
            </button>
            <button type="button" onClick={() => scrollTo('how')} className="hover:text-[#c9a84c] transition-colors cursor-pointer">
              كيف يعمل
            </button>
            <button type="button" onClick={() => scrollTo('journey')} className="hover:text-[#c9a84c] transition-colors cursor-pointer">
              رحلة التطبيق
            </button>
            <button type="button" onClick={() => scrollTo('privacy')} className="hover:text-[#c9a84c] transition-colors cursor-pointer">
              الخصوصية
            </button>
            <button type="button" onClick={() => scrollTo('credits')} className="hover:text-[#c9a84c] transition-colors cursor-pointer">
              الفريق
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SignInButton mode="modal">
              <button type="button" className="text-sm px-3 py-1.5 rounded-lg text-[#f4ecd8] hover:bg-white/5 font-cairo cursor-pointer">
                دخول
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="text-sm px-4 py-1.5 rounded-lg bg-[#c9a84c] text-[#1c120a] font-bold font-cairo hover:bg-[#e3c778] cursor-pointer"
              >
                ابدأ
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <WanisLogo variant="stacked" size={72} tagline="رفيق الحكاية — كتاب الحياة" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 text-[#e3c778] text-xs font-bold font-cairo mb-6">
              <Sparkles size={14} />
              <span>مبادرة التوثيق الشفهي — مصمّم لدور الرعاية</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-amiri font-bold text-[#f4ecd8] leading-[1.15] mb-5">
              كل نزيل{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#e3c778] via-[#c9a84c] to-[#a08131]">
                كتاب حياة
              </span>
              <br />
              يُحفظ للأبد
            </h1>

            <p className="text-lg text-[#e8ddc4]/90 font-cairo leading-relaxed max-w-xl mb-8">
              <strong className="text-[#c9a84c]">ونيس (Wanis)</strong> يحوّل ذكريات كبار السن إلى مكتبة رقمية
              أنيقة: غلاف فاخر، فصول مسجّلة، قراءة صوتية عربية، وطباعة كاملة — في واجهة عربية كاملة
              مريحة للأخصائيين والعائلات.
            </p>

            <AuthButtons size="lg" />

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-cairo text-[#c9a84c]/70">
              <span className="flex items-center gap-1.5">
                <Shield size={14} /> حساب خاص لكل دار
              </span>
              <span className="flex items-center gap-1.5">
                <Headphones size={14} /> صوت عربي زريّة
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={14} /> WCAG AAA — خط كبير
              </span>
            </div>
          </div>

          {/* Hero books stack */}
          <div className="relative flex justify-center items-center min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-[#c9a84c]/10 blur-2xl" />
            </div>
            <MiniBook
              title="كتاب حياة أبو محمد"
              subtitle="صالح · غرفة ١٠٤"
              gradient="from-[#1b382b] to-[#0d2118] border-[#2c523f]"
              className="landing-float absolute right-4 sm:right-8 top-8 z-20"
            />
            <MiniBook
              title="كتاب حياة أم فهد"
              subtitle="نورة · غرفة ٢٠٢"
              gradient="from-[#4a1515] to-[#2d0b0b] border-[#6e2222]"
              className="landing-float landing-float-delay absolute left-4 sm:left-12 top-16 z-10 scale-95 opacity-90"
            />
            <div className="relative z-30 landing-float-slow w-36 sm:w-44 aspect-[3/4] rounded-r-3xl rounded-l-md bg-gradient-to-br from-[#f4ecd8] to-[#e8ddc4] border-2 border-[#c9a84c] shadow-2xl p-5 flex flex-col">
              <div className="flex-1 flex flex-col justify-center text-center">
                <BookOpen className="mx-auto text-[#a08131] mb-3" size={36} />
                <p className="font-amiri font-bold text-[#2c1e16] text-lg leading-snug">افتح الفهرس</p>
                <p className="text-xs text-[#593119] font-cairo mt-2">٣ حكايات · تسجيل · طباعة</p>
              </div>
              <div className="h-1 rounded-full bg-[#c9a84c]/30 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-l from-[#c9a84c] to-[#a08131] rounded-full landing-shimmer" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollTo('features')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#c9a84c]/60 hover:text-[#c9a84c] animate-bounce cursor-pointer"
          aria-label="انتقل للمحتوى"
        >
          <ChevronDown size={28} />
        </button>
      </header>

      {/* What is Wanis */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-[#f4ecd8] rounded-2xl p-8 md:p-12 border-2 border-[#c9a84c] shadow-2xl relative overflow-hidden text-[#2c1e16]">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#c9a84c]/15 rounded-br-full pointer-events-none" />
          <div className="max-w-3xl relative z-10">
            <h2 className="text-2xl md:text-3xl font-amiri font-bold mb-4">ما هو ونيس؟</h2>
            <p className="font-cairo text-[#593119] leading-relaxed text-base md:text-lg">
              تطبيق ويب عربي (RTL) لموظفي الرعاية وأسر النزلاء: يجمع <strong>مكتبة كتب الحياة</strong> على
              مكتب خشبي افتراضي — كل كتاب له غلاف جلدي ملوّن، فهرس فصول، تسجيل صوتي يتحول لنص، قارئ
              صوتي بالعربية، وطباعة احترافية. عند التسجيل الأول تحصل على{' '}
              <strong>٤ كتب نموذجية</strong> (صالح، نورة، إبراهيم، لطيفة) لتفهم التطبيق قبل إضافة نزلائك الحقيقيين.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <p className="text-[#c9a84c] font-bold text-sm font-cairo mb-2">كل ما تحتاجه في مكان واحد</p>
          <h2 className="text-3xl md:text-4xl font-amiri font-bold text-[#f4ecd8]">مميزات التطبيق الكاملة</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl bg-[#1c120a]/60 border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all hover:-translate-y-1 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a08131] flex items-center justify-center text-[#1c120a] mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={22} />
              </div>
              <h3 className="font-amiri font-bold text-xl text-[#f4ecd8] mb-2">{f.title}</h3>
              <p className="text-sm text-[#e8ddc4]/75 font-cairo leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-amiri font-bold text-[#f4ecd8]">كيف تبدأ في دقائق؟</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative p-6 rounded-xl border border-[#c9a84c]/25 bg-gradient-to-b from-[#3a2010]/50 to-transparent"
            >
              <span className="absolute -top-3 right-4 w-10 h-10 rounded-full bg-[#c9a84c] text-[#1c120a] font-amiri font-bold text-lg flex items-center justify-center shadow-lg">
                {s.n}
              </span>
              <h3 className="font-amiri font-bold text-lg mt-4 mb-2 text-[#e3c778]">{s.title}</h3>
              <p className="text-sm font-cairo text-[#e8ddc4]/80 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App journey */}
      <section id="journey" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="bg-[#f4ecd8]/95 rounded-2xl p-8 md:p-10 border-2 border-[#c9a84c] text-[#2c1e16]">
          <h2 className="text-2xl md:text-3xl font-amiri font-bold text-center mb-2">رحلة واحدة من المكتبة إلى الطباعة</h2>
          <p className="text-center font-cairo text-[#593119] mb-10 max-w-2xl mx-auto">
            كل شاشة مصممة كتجربة كتاب حقيقي — ليس مجرد نماذج بيانات.
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-0 md:flex-nowrap items-center mb-10">
            {JOURNEY.map((j, i) => (
              <div key={j.label} className="flex items-center">
                <div className="flex flex-col items-center w-24 md:w-28">
                  <div className="w-14 h-14 rounded-full bg-[#3a2010] text-[#c9a84c] flex items-center justify-center border-2 border-[#c9a84c] shadow-md">
                    <j.icon size={24} />
                  </div>
                  <span className="mt-2 text-xs font-bold font-cairo text-[#2c1e16]">{j.label}</span>
                </div>
                {i < JOURNEY.length - 1 && (
                  <span className="hidden md:block w-6 lg:w-10 h-0.5 bg-[#c9a84c]/40 mx-1" aria-hidden />
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-sm font-cairo text-[#593119]">
            <div className="p-4 rounded-lg bg-white/40 border border-[#c9a84c]/30">
              <strong className="text-[#2c1e16] font-amiri text-base block mb-1">المكتبة والبحث</strong>
              بطاقات الكتب على الرف الخشبي؛ بحث بالاسم والكنية والغرفة وعنوان الكتاب.
            </div>
            <div className="p-4 rounded-lg bg-white/40 border border-[#c9a84c]/30">
              <strong className="text-[#2c1e16] font-amiri text-base block mb-1">الغلاف والفهرس</strong>
              غلاف ثلاثي الأبعاد بألوان (زمردي، عنابي، ياقوتي، كهرماني) ثم فهرس الفصول.
            </div>
            <div className="p-4 rounded-lg bg-white/40 border border-[#c9a84c]/30">
              <strong className="text-[#2c1e16] font-amiri text-base block mb-1">التسجيل والتحرير</strong>
              تسجيل صوتي عربي، مراجعة النص، عنوان الحكاية، ثم حفظ الفصل في الفهرس.
            </div>
            <div className="p-4 rounded-lg bg-white/40 border border-[#c9a84c]/30">
              <strong className="text-[#2c1e16] font-amiri text-base block mb-1">القراءة والطباعة</strong>
              خط أميري كبير للقراءة، تشغيل TTS، وطباعة الكتاب كاملاً بحدود ذهبية.
            </div>
          </div>
        </div>
      </section>

      {/* Demo library */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[#c9a84c] text-sm font-bold font-cairo mb-2">
            <UserPlus size={16} />
            جاهز من أول تسجيل دخول
          </div>
          <h2 className="text-3xl font-amiri font-bold">٤ كتب نموذجية في مكتبتك</h2>
          <p className="mt-3 font-cairo text-[#e8ddc4]/80 max-w-xl mx-auto text-sm">
            نسخة خاصة بحسابك — ليست مشتركة مع الآخرين. جرّب التسجيل والطباعة والصوت قبل إضافة نزلائك.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {DEMO_BOOKS.map((b) => (
            <div
              key={b.name}
              className={`w-36 sm:w-40 aspect-[3/4] rounded-r-2xl rounded-l-sm bg-gradient-to-br ${b.color} border-r-[8px] p-4 flex flex-col justify-end shadow-xl hover:scale-105 transition-transform`}
            >
              <p className="font-amiri font-bold text-[#f4ecd8] text-sm leading-tight">{b.title}</p>
              <p className="text-[10px] text-[#c9a84c] font-cairo mt-1">{b.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-amiri font-bold mb-4">بياناتك ملكك — دارك وحدها</h2>
            <ul className="space-y-4 font-cairo text-[#e8ddc4]/85 text-sm leading-relaxed">
              <li className="flex gap-3">
                <Lock className="shrink-0 text-[#c9a84c]" size={20} />
                <span>كل مستخدم جديد يحصل على <strong>دار رعاية مستقلة</strong> — لا تشارك النزلاء مع حسابات أخرى.</span>
              </li>
              <li className="flex gap-3">
                <Shield className="shrink-0 text-[#c9a84c]" size={20} />
                <span>تسجيل الدخول عبر <strong>Clerk</strong> — جلسات آمنة لكل أخصائي.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="shrink-0 text-[#c9a84c]" size={20} />
                <span>البيانات في <strong>PostgreSQL</strong> مع عزل حسب دار الرعاية على الخادم.</span>
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-2xl border-2 border-dashed border-[#c9a84c]/40 bg-[#1c120a]/50 text-center flex flex-col items-center">
            <WanisLogoMark size={80} className="mb-3" />
            <p className="font-amiri text-3xl text-[#c9a84c] mb-2">ونيس</p>
            <p className="font-cairo text-sm text-[#e8ddc4]/70">
              مصمم لرعاية كبار السن — واجهة عربية، خطوط كبيرة، وتباين عالٍ
            </p>
          </div>
        </div>
      </section>

      {/* Credits — team & supervisor */}
      <section id="credits" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#c9a84c] bg-[#f4ecd8] text-[#2c1e16] shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a84c]/15 rounded-bl-[100%] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#593119]/5 rounded-tr-full pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#a08131] text-xs font-bold font-cairo mb-4">
                <Heart size={14} className="text-[#7a2f2f]" fill="currentColor" />
                <span>صُنع بأيدٍ طلابية — لخدمة كبار السن</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-amiri font-bold text-[#2c1e16] mb-3">
                من ابتكر ونيس؟
              </h2>
              <p className="font-cairo text-[#593119] max-w-2xl mx-auto leading-relaxed">
                هذا التطبيق ثمرة عمل فريق طلابي متعاون، بإشراف معلّمتهم، بهدف توثيق ذكريات كبار السن
                وإحياء قيمة الحكاية الشفهية في بيئة الرعاية.
              </p>
            </div>

            {/* Supervisor spotlight */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative p-6 md:p-8 rounded-xl bg-gradient-to-br from-[#1c120a] to-[#3a2010] border-2 border-[#c9a84c] text-center shadow-lg">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#c9a84c] text-[#1c120a] text-xs font-bold font-cairo shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <GraduationCap size={14} />
                  <span>المشرفة الأكاديمية</span>
                </div>
                <div className="w-16 h-16 mx-auto mt-4 mb-4 rounded-full bg-[#c9a84c]/20 border-2 border-[#e3c778] flex items-center justify-center">
                  <GraduationCap className="text-[#e3c778]" size={32} />
                </div>
                <p className="font-amiri text-2xl md:text-3xl font-bold text-[#f4ecd8] mb-1">
                  {TEAM_SUPERVISOR}
                </p>
                <p className="text-sm font-cairo text-[#c9a84c]/90">
                  شكراً لتوجيهكِ وإلهامكِ طوال رحلة المشروع
                </p>
              </div>
            </div>

            {/* Student team */}
            <div>
              <div className="flex items-center justify-center gap-2 text-[#a08131] font-bold text-sm font-cairo mb-6">
                <Users size={18} />
                <span>فريق التطوير والتصميم</span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-5xl mx-auto">
                {TEAM_CREATORS.map((name, index) => (
                  <li
                    key={name}
                    className={
                      index === TEAM_CREATORS.length - 1 && TEAM_CREATORS.length % 2 === 1
                        ? 'sm:col-span-2 sm:max-w-xs sm:mx-auto lg:col-span-1 lg:max-w-none xl:col-span-1'
                        : undefined
                    }
                  >
                    <div className="group flex items-center gap-3 p-4 rounded-xl bg-white/60 border border-[#c9a84c]/30 hover:border-[#c9a84c] hover:bg-white/90 hover:shadow-md transition-all h-full">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a08131] text-[#1c120a] font-amiri font-bold text-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        {index + 1}
                      </span>
                      <span className="font-amiri text-lg font-bold text-[#2c1e16] leading-snug">
                        {name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="text-center mt-8 text-xs font-cairo text-[#593119]/80 italic">
                مع تقدير لكل من ساهم في إحياء فكرة «كتاب الحياة» الرقمي
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#c9a84c] p-10 md:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a2010] via-[#1c120a] to-[#0d2118]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-amiri font-bold text-[#f4ecd8] mb-4">
              ابدأ توثيق حكايات دارك اليوم
            </h2>
            <p className="font-cairo text-[#e8ddc4]/80 mb-8 max-w-lg mx-auto">
              أنشئ حساباً مجاناً، سمِّ دارك، وافتح أول كتاب حياة — النماذج الأربعة في انتظارك.
            </p>
            <AuthButtons size="lg" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3a2010] bg-[#1c120a]/90 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-cairo">
          <p className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 text-center sm:text-right">
            <WanisLogoMark size={28} />
            <span>
            <strong className="text-[#c9a84c]">ونيس (Wanis)</strong> — كتاب الحياة لرعاية كبار السن ©{' '}
            {new Date().getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => scrollTo('credits')}
              className="block mt-1 text-[#c9a84c]/70 hover:text-[#c9a84c] cursor-pointer transition-colors"
            >
              صُنع بفريق طلابي — بإشراف {TEAM_SUPERVISOR}
            </button>
          </p>
          <div className="flex items-center gap-4 text-[#c9a84c]/80">
            <span>WCAG AAA</span>
            <span>•</span>
            <span>أميري + كايرو</span>
            <span>•</span>
            <span>RTL عربي</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
