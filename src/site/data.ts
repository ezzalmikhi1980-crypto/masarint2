export type Language = 'en' | 'ar';
export type Copy = { en: string; ar: string };
export type ServiceKind = 'ocean' | 'air' | 'land' | 'customs' | 'warehouse' | 'control';
export type Service = { no: string; kind: ServiceKind; title: Copy; body: Copy; meta: Copy };

export const text = (value: Copy, lang: Language) => value[lang];

export const services: Service[] = [
  { no: '01', kind: 'ocean', title: { en: 'Ocean freight', ar: 'الشحن البحري' }, body: { en: 'Port-to-port control across the lanes that keep your business moving.', ar: 'تحكم كامل من ميناء إلى ميناء عبر المسارات التي تحافظ على استمرارية أعمالك.' }, meta: { en: 'FCL · LCL · Project cargo', ar: 'حاويات كاملة · شحن جزئي · حمولات المشاريع' } },
  { no: '02', kind: 'air', title: { en: 'Air freight', ar: 'الشحن الجوي' }, body: { en: 'Time-critical uplift with clear milestones from pickup to final handover.', ar: 'حلول سريعة للشحنات العاجلة مع متابعة واضحة من الاستلام حتى التسليم.' }, meta: { en: 'Priority · Express · Consolidated', ar: 'أولوية · سريع · مجمع' } },
  { no: '03', kind: 'land', title: { en: 'Land transport', ar: 'النقل البري' }, body: { en: 'Reliable first and last mile connections, managed around your schedule.', ar: 'روابط موثوقة للميل الأول والأخير، تدار وفق جدولك التشغيلي.' }, meta: { en: 'Cross-border · Door delivery', ar: 'عبر الحدود · توصيل حتى الباب' } },
  { no: '04', kind: 'customs', title: { en: 'Customs clearance', ar: 'التخليص الجمركي' }, body: { en: 'Every document right the first time, so your cargo crosses the border without waiting in line.', ar: 'كل مستند صحيح من المرة الأولى، لتعبر شحنتك الحدود دون انتظار أو تأخير.' }, meta: { en: 'Import · Export · Documentation', ar: 'استيراد · تصدير · مستندات' } },
  { no: '05', kind: 'warehouse', title: { en: 'Warehousing', ar: 'التخزين والتوزيع' }, body: { en: 'Practical storage, handling and distribution capacity close to the action.', ar: 'مساحات عملية للتخزين والمناولة والتوزيع بالقرب من مراكز الحركة.' }, meta: { en: 'Storage · Fulfilment · Inventory', ar: 'تخزين · تنفيذ · مخزون' } },
  { no: '06', kind: 'control', title: { en: 'End-to-end control', ar: 'التنسيق المتكامل' }, body: { en: 'One accountable team aligning carriers, documents, customs and delivery.', ar: 'فريق واحد مسؤول ينسق الناقلين والمستندات والجمارك والتسليم.' }, meta: { en: 'One view · One partner', ar: 'رؤية واحدة · شريك واحد' } },
];

export const gallery: { src: string; label: Copy }[] = [
  { src: '/gallery-compass.jpg', label: { en: 'Sea · Charting the course', ar: 'البحر · نرسم الاتجاه' } },
  { src: '/gallery-air-sea.jpg', label: { en: 'Air · Sea · One partner', ar: 'جو · بحر · شريك واحد' } },
  { src: '/gallery-globe.jpg', label: { en: 'Land · Sea · Air, connected', ar: 'بر · بحر · جو، متصلة' } },
];
