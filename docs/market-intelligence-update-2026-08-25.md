# تقرير تحديث ForexMax Market Intelligence

**التاريخ:** 25 أغسطس 2026  
**الفرع:** `migration/nextjs-platform`  
**الالتزام:** `ee80c83` — `feat: enrich source-aware market intelligence`

## نطاق التنفيذ

نُفذت هذه الدفعة في فرع التطوير فقط. لم يُعدّل `main`، ولم تُنفذ migration أو seed أو عملية كتابة على قاعدة بيانات Supabase Production، ولم تُغيّر إعدادات DNS أو Deployment Production أو متغيرات بيئته. التحديث لا يضيف مسارًا مجدولًا أو polling أو scraping واسعًا أو نشرًا آليًا.

| المجال | ما تغير |
|---|---|
| **Macro desk** | أضيفت قراءة واحدة محدودة من واجهة U.S. Treasury Fiscal Data الرسمية: أحدث سجل `Debt to the Penny` لحقل **Total Public Debt Outstanding**. يظهر المصدر والفترة المرجعية والملاحظة المنهجية، ولا يعرض السجل كسعر أو عائد أو توصية أو توقع. |
| **Homepage** | توسعت بطاقة “Official observations on the desk” لتشمل القراءة الرسمية الجديدة بصيغة مختصرة للواجهة، بينما تحافظ صفحة Macro على المبلغ كاملًا كما ورد من المصدر. |
| **Market pages** | تحولت صفحات FX والسلع والمؤشرات والأصول الرقمية والماكرو من حالة حجز عامة إلى صفحات تغطية ذات: حالة شفافة، عقود مصدر محددة، ناشرين رسميين، وحدود نشر قابلة للتدقيق. لا تزال الصفحات تمتنع عن عرض أسعار أو claims أو إشارات لا سند لها. |
| **SEO** | أصبحت صفحات الأسواق المصدرية قابلة للفهرسة، وأضيفت إلى sitemap مع `CollectionPage` JSON-LD وmetadata خاصة بكل سوق. تبقى مسارات الإدارة والبحث الاستعلامي خارج sitemap وممنوعة من الفهرسة. |
| **لغة الجودة** | استبدلت عبارة “Data unavailable” للمصادر غير المفعلة بعبارة **“Source contract pending”**، التي تشرح بوضوح غياب عقد مصدر معتمد بدل الإيحاء بخلل تقني أو اختراع بديل. |

## المصادر المستخدمة

> لا تعني الإشارة إلى ناشر أن كل بياناته أو كل API لديه نشطة. كل عرض يذكر مصدره وفترته المرجعية ويحتفظ بحدود التفسير.

| المصدر | الاستخدام في هذه الدفعة | الحدود |
|---|---|---|
| [BLS Public Data API][1] | CPI-U ومعدل البطالة في Desk الحالي. | ملاحظة رسمية مع فترة مرجعية، وليست توقعًا أو أثرًا سوقيًا. |
| [FRED][2] | سلسلة DGS10 المنشورة رسميًا. | قراءة يومية منشورة، وليست عرضًا لحظيًا للعائد. |
| [U.S. Treasury Fiscal Data API][3] | أحدث سجل رسمي للدين العام القائم. | سجل ميزانية/دين؛ ليس عائد سند أو سعرًا أو إشارة تداول. |
| [مصدر Treasury: Debt to the Penny][4] | رابط المصدر المباشر في صف الماكرو. | القيمة محكومة بمنهجية مجموعة البيانات لدى Treasury. |

## التحقق والجودة

| الفحص | النتيجة |
|---|---|
| اختبارات Vitest | **48 اختبارًا ضمن 20 ملف اختبار ناجحًا**. |
| TypeScript | `pnpm exec tsc --noEmit` ناجح. |
| ESLint | `pnpm lint` ناجح. |
| Next.js production build | ناجح؛ تم توليد **48** صفحة ثابتة، بما فيها مسارات الأسواق الخمسة. |
| فحص محلي مرئي | تم فحص `/markets/forex` و`/macro`. ظهرت عقود المصدر الأربع في FX، وظهرت قراءات BLS/FRED/Treasury مع المصدر والفترة والمنهجية في Macro. |
| Vercel Preview | Deployment `dpl_GJCYorn3bFnNQ7zeLJXfr4FqryQH` للحزمة `ee80c83` بحالة **READY**. سجل البناء اكتمل في 13 ثانية بلا أخطاء بناء. |
| أخطاء Runtime | لم يظهر أي cluster لأخطاء Runtime في نافذة الساعة الأخيرة بعد النشر. |

## معاينة Vercel

رابط المعاينة المرتبط بالفرع: [https://forex-1knptw8qi-nawazakis-projects.vercel.app](https://forex-1knptw8qi-nawazakis-projects.vercel.app)

المعاينة محمية بـVercel SSO عمدًا. تم الإبقاء على الحماية كما هي. لذلك لم يُسجل smoke test خارجي جديد للمسارات المنشورة، إذ أعاد الوصول الخارجي توجيهًا إلى SSO مع `noindex`. هذا **قيد تحقق** وليس خطأ في البناء أو Runtime.

## القيود والخطوات التالية

لا تزال Source Manager وResearch Queue وEvidence Records وEditorial Review ورفع الوسائط تتطلب قرارًا صريحًا بشأن قاعدة بيانات غير إنتاجية أو تصريح كتابة على Production؛ لم تُفعّل حفاظًا على القيد الحالي بعدم تعديل جداول Production أو محتواها. كذلك لم تُشغّل BEA وCFTC كقراءات حية لأن كل منهما يحتاج أولًا عقد dataset/series محددًا، مع سياسة وحدات وفترة وتحقق مناسبة.

إذا أردت التحقق الحي للـPreview المحمي، يلزم استخدام جلسة Vercel المالكة أو تعطيل الحماية **للمعاينة فقط** بموافقة صريحة؛ لم أغيّر SSO أو أي إعداد حماية.

## المراجع

[1]: https://www.bls.gov/developers/ "BLS Developers — Public Data API"
[2]: https://fred.stlouisfed.org/docs/api/fred/ "FRED API Documentation"
[3]: https://fiscaldata.treasury.gov/api-documentation/ "U.S. Treasury Fiscal Data API Documentation"
[4]: https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny "U.S. Treasury Fiscal Data — Debt to the Penny"
