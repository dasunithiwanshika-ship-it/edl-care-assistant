import { Language } from "@/types";

export interface TranslationStrings {
  brandName: string;
  brandSubtitle: string;
  demoNotice: string;
  fictionalDataBanner: string;
  
  // Navigation
  nav: {
    dashboard: string;
    myAccount: string;
    bills: string;
    consumption: string;
    outageMap: string;
    complaints: string;
    aiAssistant: string;
    settings: string;
  };

  // Header
  header: {
    notifications: string;
    profile: string;
    toggleTheme: string;
    selectLanguage: string;
    searchPlaceholder: string;
  };

  // Account Card
  accountCard: {
    title: string;
    accountNumber: string;
    nickname: string;
    billingMonth: string;
    outstandingBalance: string;
    dueDate: string;
    billDetails: string;
    payNow: string;
    tariff: string;
    paymentSuccess: string;
    paymentModalTitle: string;
    billModalTitle: string;
    close: string;
    proceedPayment: string;
  };

  // Monthly Usage
  usageCard: {
    title: string;
    subtitle: string;
    unitsConsumed: string;
    estimatedCost: string;
    averageUnits: string;
    compareLastMonth: string;
    kwh: string;
  };

  // Outage Card
  outageCard: {
    title: string;
    description: string;
    reportNow: string;
    viewMap: string;
    statusNormal: string;
    activeNotice: string;
  };

  // Quick Services
  quickServices: {
    title: string;
    viewBill: string;
    viewBillDesc: string;
    checkOutage: string;
    checkOutageDesc: string;
    reportBreakdown: string;
    reportBreakdownDesc: string;
    solarServices: string;
    solarServicesDesc: string;
  };

  // Outage Map Page
  outageMapPage: {
    title: string;
    subtitle: string;
    searchLocation: string;
    allProvinces: string;
    allDistricts: string;
    filterAll: string;
    filterPlanned: string;
    filterBreakdown: string;
    plannedOutages: string;
    activeBreakdowns: string;
    affectedPremises: string;
    estimatedRestoration: string;
    feeder: string;
    reason: string;
    reportBreakdownBtn: string;
    refreshData: string;
    mapLegend: string;
    legendPlanned: string;
    legendBreakdown: string;
    legendRestoring: string;
    interactiveNotice: string;
  };

  // Chatbot
  chatbot: {
    title: string;
    status: string;
    welcomeMsg: string;
    guestWelcomeMsg: string;
    customerWelcomeMsg: string;
    inputPlaceholder: string;
    send: string;
    typing: string;
    disclaimer: string;
    suggestedQuestionsTitle: string;
    guestModeLabel: string;
    customerModeLabel: string;
    guestModeDesc: string;
    customerModeDesc: string;
    switchModeNotice: string;
    viewFeatureMatrix: string;
    loginRequiredMsg: string;
    quickReplies: {
      highBill: string;
      outageArea: string;
      reportBreakdown: string;
      solarCapacity: string;
      understandBill: string;
      tariffExpl: string;
      safetyGuide: string;
      generalOutage: string;
      guestBillCheck: string;
      myBill: string;
      myConsumption: string;
      trackComplaint: string;
      mySolar: string;
    };
    mockAnswers: {
      highBill: string;
      outageArea: string;
      reportBreakdown: string;
      solarCapacity: string;
      defaultFallback: string;
      understandBill: string;
      tariffExpl: string;
      safetyGuide: string;
      generalOutage: string;
      guestBillCheck: string;
      myBill: string;
      myConsumption: string;
      trackComplaint: string;
      mySolar: string;
    };
  };
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    brandName: "EDL Care Assistant",
    brandSubtitle: "Electricity Distribution Lanka",
    demoNotice: "Demonstration Prototype – Fictional Data",
    fictionalDataBanner: "NOTICE: This is an independent demonstration prototype. All customer records, billing values, and outage locations are fictional.",
    nav: {
      dashboard: "Dashboard",
      myAccount: "My Account",
      bills: "Electricity Bills",
      consumption: "Consumption History",
      outageMap: "Outage Map",
      complaints: "Complaints",
      aiAssistant: "AI Assistant",
      settings: "Settings",
    },
    header: {
      notifications: "Notifications",
      profile: "Customer Profile",
      toggleTheme: "Toggle Theme",
      selectLanguage: "Select Language",
      searchPlaceholder: "Search account, bill number, or services...",
    },
    accountCard: {
      title: "Account Summary",
      accountNumber: "Account Number",
      nickname: "Premises Nickname",
      billingMonth: "Billing Month",
      outstandingBalance: "Outstanding Balance",
      dueDate: "Payment Due Date",
      billDetails: "Bill Details",
      payNow: "Pay Now",
      tariff: "Tariff Category",
      paymentSuccess: "Demo payment simulated successfully!",
      paymentModalTitle: "Mock Electricity Bill Payment",
      billModalTitle: "Electricity Bill Breakdown (Demo)",
      close: "Close",
      proceedPayment: "Pay with Card / Online Banking (Demo)",
    },
    usageCard: {
      title: "Monthly Electricity Consumption",
      subtitle: "6-Month historical consumption in kilowatt-hours (kWh)",
      unitsConsumed: "Units Consumed",
      estimatedCost: "Billed Amount",
      averageUnits: "Monthly Average",
      compareLastMonth: "+8.4% compared to last month",
      kwh: "kWh",
    },
    outageCard: {
      title: "Power Outage?",
      description: "Experience power disruptions or voltage fluctuations? Check live status or submit an immediate breakdown ticket to our 24/7 technical crew.",
      reportNow: "Report Now",
      viewMap: "View Outage Map",
      statusNormal: "Normal Grid Operations in your feeder zone",
      activeNotice: "Live maintenance crews deployed in Colombo & Kandy zones.",
    },
    quickServices: {
      title: "Quick Services",
      viewBill: "View Electricity Bill",
      viewBillDesc: "Download statement, check previous payments and meter readings",
      checkOutage: "Check Outage",
      checkOutageDesc: "Search by account number, transformer code or street name",
      reportBreakdown: "Report Breakdown",
      reportBreakdownDesc: "Submit line fault, spark hazard or no-power alert",
      solarServices: "Solar Services",
      solarServicesDesc: "Net-metering application, transformer capacity & green tariffs",
    },
    outageMapPage: {
      title: "Electricity Outage Map & Grid Monitor",
      subtitle: "Live view of planned maintenance and unscheduled technical breakdowns across Sri Lanka.",
      searchLocation: "Search province, district, feeder or town...",
      allProvinces: "All Provinces",
      allDistricts: "All Districts",
      filterAll: "All Outages",
      filterPlanned: "Planned Outages",
      filterBreakdown: "Active Breakdowns",
      plannedOutages: "Planned Maintenance",
      activeBreakdowns: "Unscheduled Breakdowns",
      affectedPremises: "Affected Premises",
      estimatedRestoration: "Estimated Restoration",
      feeder: "Feeder / Substation",
      reason: "Reason",
      reportBreakdownBtn: "Report New Breakdown",
      refreshData: "Refresh Grid Status",
      mapLegend: "Grid Map Legend",
      legendPlanned: "Planned Maintenance (Scheduled)",
      legendBreakdown: "Technical Breakdown (Crew Assigned)",
      legendRestoring: "Restoration In Progress",
      interactiveNotice: "Interactive map visualization layer prepared for OpenStreetMap & Leaflet integration.",
    },
    chatbot: {
      title: "EDL Care Assistant",
      status: "Online • AI Support Ready",
      welcomeMsg: "Ayubowan / Vanakkam! I am your EDL Care AI Assistant. How may I help you today?",
      guestWelcomeMsg: "Ayubowan / Vanakkam! I am EDL Care Assistant in Guest Mode. I can help with general electricity FAQs, tariff structures, safety precautions, and outage procedures. Sign in anytime to access personalized account bills.",
      customerWelcomeMsg: "Hello Dasuni! I am your EDL Care Assistant in Customer Mode. Connected to Account #0412345678 (Home). How can I assist with your bills, consumption, or complaints today?",
      inputPlaceholder: "Type your electricity query in English, Sinhala or Tamil...",
      send: "Send",
      typing: "EDL Assistant is drafting a reply...",
      disclaimer: "Demo Assistant: Simulated AI responses powered by Gemini & RAG architecture.",
      suggestedQuestionsTitle: "Suggested Questions",
      guestModeLabel: "Guest Mode",
      customerModeLabel: "Customer Mode",
      guestModeDesc: "Public Knowledge • No login required",
      customerModeDesc: "Authenticated: Account #0412345678",
      switchModeNotice: "Switch mode to test Guest vs Authenticated permissions.",
      viewFeatureMatrix: "Compare Modes",
      loginRequiredMsg: "🔒 Customer Login Required: In Guest Mode, personal bills and account records are protected. Please sign in to view your outstanding balance, 6-month consumption, and active breakdown complaints.",
      quickReplies: {
        highBill: "Why is my electricity bill high?",
        outageArea: "Is there a power outage in my area?",
        reportBreakdown: "How can I report a breakdown?",
        solarCapacity: "How can I check solar transformer capacity?",
        understandBill: "How can I understand my electricity bill?",
        tariffExpl: "Explain domestic electricity tariffs",
        safetyGuide: "What are essential electrical safety tips?",
        generalOutage: "How does planned outage maintenance work?",
        guestBillCheck: "What is my outstanding bill? (Login test)",
        myBill: "What is my outstanding bill?",
        myConsumption: "Show my October 2026 consumption",
        trackComplaint: "Track my breakdown complaint",
        mySolar: "Check rooftop solar capacity for my feeder",
      },
      mockAnswers: {
        highBill: "Your current billing cycle recorded 154 kWh compared to your 6-month average of 138 kWh. Common factors in domestic tariffs include tier escalations above 120 units, fuel adjustment surcharges, and heavy appliance usage (air conditioning/water heaters). You can review your day-by-day consumption chart in the dashboard.",
        outageArea: "For Account #0412345678 (Colombo 05), there is currently an active breakdown report on Feeder F-04 Havelock due to heavy rain. Our technical crew is on-site and estimated restoration is 02:30 PM today. You can monitor progress on our Outage Map.",
        reportBreakdown: "To report a breakdown, click the 'Report Breakdown' button on the dashboard or provide your 10-digit account number (#0412345678) and issue description here. In emergencies like fallen lines or transformer sparks, contact our 24/7 hotline at 1987 immediately.",
        solarCapacity: "For rooftop solar net-metering applications, transformer clearance is required. In your area (Colombo 05 / F-04), available hosting capacity is currently 35 kVA out of 100 kVA rated capacity. You can submit an initial grid feasibility assessment through our Solar Services portal.",
        defaultFallback: "Thank you for reaching out to EDL Care Assistant. We have registered your request. For urgent electrical hazards or supply restoration, please call the 24/7 emergency dispatch at 1987 or visit your local EDL Area Engineer office.",
        understandBill: "I can help you understand electricity billing, consumption units and applicable tariff structures. In Sri Lanka, domestic bills consist of (1) Block-based energy charges per kWh, (2) Fixed service charges, and (3) Applicable fuel adjustment levy. Would you like to explore a sample bill breakdown?",
        tariffExpl: "Domestic tariffs operate on cumulative 30-day blocks: 0–30 units (lowest subsidized rate), 31–60 units, 61–90 units, 91–120 units, and >120 units. Staying below 60 units qualifies households for subsidized lifeline rates.",
        safetyGuide: "Essential safety guidance: (1) Test your Earth Leakage Circuit Breaker (ELCB/Trip Switch) monthly, (2) Never touch wet electrical switches, (3) Keep 3 meters clear of overhead service lines, and (4) Call 1987 immediately if you spot a fallen wire or sparking transformer.",
        generalOutage: "EDL schedules planned maintenance to conduct vegetation clearing, line insulation upgrades, and transformer maintenance. Notices are published 48 hours in advance in national newspapers and on our live Outage Map.",
        guestBillCheck: "🔒 Login Required: You are currently browsing in Guest Mode. To protect personal financial data, bill balances are only accessible to authenticated customers. Please sign in or switch to Customer Mode to view Account #0412345678.",
        myBill: "Your demo account (#0412345678 – Home) has an outstanding balance of Rs. 4,850.00 for October 2026. Payment due date is 25 Nov 2026. Would you like to proceed with an instant online payment?",
        myConsumption: "In October 2026, your household consumed 142 kWh (Down 11.2% from September's 160 kWh). Your 6-month average is 154 kWh, keeping you within the standard domestic efficiency bracket.",
        trackComplaint: "Complaint #REF-2026-9841 ('Service wire sparking near roof eaves') logged on 12 Nov 2026 is currently IN PROGRESS. Assigned Depot: Colombo South. Estimated on-site completion: Today by 4:00 PM.",
        mySolar: "Your connected distribution transformer (TR-402, Nugegoda / Feeder F-04) has 42 kW of remaining rooftop solar absorption capacity. You can proceed with a Net-Metering or Net-Plus grid application.",
      },
    },
  },
  si: {
    brandName: "ඊ.ඩී.එල් කෙයාර් සහයක",
    brandSubtitle: "විදුලි බෙදාහැරීම් ලංකා",
    demoNotice: "නිරූපණ ආකෘතිය – මනඃකල්පිත දත්ත",
    fictionalDataBanner: "දැන්වීමයි: මෙය ස්වාධීන ආදර්ශන මූලාකෘතියකි. සියලුම ගිණුම් විස්තර, බිල්පත් අගයන් සහ විදුලි බිඳවැටීම් ස්ථාන නිරූපණය සඳහා පමණි.",
    nav: {
      dashboard: "පාලක පුවරුව",
      myAccount: "මගේ ගිණුම",
      bills: "විදුලි බිල්පත්",
      consumption: "විදුලි භාවිතය",
      outageMap: "විදුලි බිඳවැටීම් සිතියම",
      complaints: "පැමිණිලි",
      aiAssistant: "AI සහයක",
      settings: "සැකසුම්",
    },
    header: {
      notifications: "දැනුම්දීම්",
      profile: "පාරිභෝගික ගිණුම",
      toggleTheme: "තේමාව මාරු කරන්න",
      selectLanguage: "භාෂාව තෝරන්න",
      searchPlaceholder: "ගිණුම් අංකය, බිල්පත හෝ සේවාවන් සොයන්න...",
    },
    accountCard: {
      title: "ගිණුම් සාරාංශය",
      accountNumber: "ගිණුම් අංකය",
      nickname: "ස්ථාන නාමය",
      billingMonth: "බිල්පත් මාසය",
      outstandingBalance: "ගෙවිය යුතු ශේෂය",
      dueDate: "ගෙවිය යුතු අවසන් දිනය",
      billDetails: "බිල්පත් විස්තර",
      payNow: "දැන් ගෙවන්න",
      tariff: "ගාස්තු කාණ්ඩය",
      paymentSuccess: "ආදර්ශන ගෙවීම සාර්ථකයි!",
      paymentModalTitle: "ආදර්ශන විදුලි බිල්පත් ගෙවීම",
      billModalTitle: "විදුලි බිල්පත් විස්තරය (ආදර්ශන)",
      close: "වසන්න",
      proceedPayment: "කාඩ්පත / ඔන්ලයින් ගෙවන්න (Demo)",
    },
    usageCard: {
      title: "මාසික විදුලි පරිභෝජනය",
      subtitle: "කිලෝවොට් පැය (kWh) අනුව මාස 6ක විදුලි භාවිත ඉතිහාසය",
      unitsConsumed: "භාවිතා කළ ඒකක",
      estimatedCost: "බිල්පත් මුදල",
      averageUnits: "මාසික සාමාන්‍යය",
      compareLastMonth: "පසුගිය මාසයට වඩා +8.4% වැඩිවීමක්",
      kwh: "කිලෝවොට් පැය",
    },
    outageCard: {
      title: "විදුලිය ඇනහිටීමක්ද?",
      description: "විදුලි සැපයුම ඇනහිටීමක් හෝ වෝල්ටීයතා ගැටලුවක් තිබේද? සජීවී තත්ත්වය පරීක්ෂා කරන්න හෝ අපගේ 24/7 කාර්මික අංශයට වාර්තා කරන්න.",
      reportNow: "දැන් වාර්තා කරන්න",
      viewMap: "සිතියම බලන්න",
      statusNormal: "ඔබගේ ප්‍රදේශයේ විදුලි ජාලය සාමාන්‍ය පරිදි ක්‍රියාත්මකයි",
      activeNotice: "කොළඹ සහ මහනුවර ප්‍රදේශවල නඩත්තු කණ්ඩායම් ක්‍රියාත්මක වේ.",
    },
    quickServices: {
      title: "ක්ෂණික සේවාවන්",
      viewBill: "විදුලි බිල්පත බලන්න",
      viewBillDesc: "බිල්පත බාගත කරන්න සහ මීටර් කියවීම් පරීක්ෂා කරන්න",
      checkOutage: "ඇනහිටීම් පරීක්ෂාව",
      checkOutageDesc: "ගිණුම් අංකය හෝ ට්‍රාන්ස්ෆෝමර් කේතය අනුව සොයන්න",
      reportBreakdown: "බිඳවැටීමක් වාර්තා කිරීම",
      reportBreakdownDesc: "විදුලි රැහැන් දෝෂ හෝ අනතුරු ක්ෂණිකව දන්වන්න",
      solarServices: "සූර්ය බල සේවා",
      solarServicesDesc: "සූර්ය බල පද්ධති සම්බන්ධතා සහ ට්‍රාන්ස්ෆෝමර් ධාරිතාව",
    },
    outageMapPage: {
      title: "විදුලි බිඳවැටීම් සිතියම සහ ජාල අධීක්ෂණය",
      subtitle: "ශ්‍රී ලංකාව පුරා සැලසුම් සහගත නඩත්තු සහ හදිසි විදුලි බිඳවැටීම් සජීවීව නිරීක්ෂණය කරන්න.",
      searchLocation: "පළාත, දිස්ත්‍රික්කය හෝ නගරය සොයන්න...",
      allProvinces: "සියලුම පළාත්",
      allDistricts: "සියලුම දිස්ත්‍රික්ක",
      filterAll: "සියලුම ඇනහිටීම්",
      filterPlanned: "සැලසුම් කළ නඩත්තු",
      filterBreakdown: "හදිසි බිඳවැටීම්",
      plannedOutages: "සැලසුම් කළ නඩත්තු කටයුතු",
      activeBreakdowns: "හදිසි විදුලි බිඳවැටීම්",
      affectedPremises: "බලපෑමට ලක්වූ පාරිභෝගිකයින්",
      estimatedRestoration: "යථා තත්ත්වයට පත්වන වේලාව",
      feeder: "උපපොළ / ෆීඩරය",
      reason: "හේතුව",
      reportBreakdownBtn: "නව බිඳවැටීමක් වාර්තා කරන්න",
      refreshData: "දත්ත යාවත්කාලීන කරන්න",
      mapLegend: "සිතියම් සලකුණු",
      legendPlanned: "සැලසුම් කළ නඩත්තු (දැනුම්දුන්)",
      legendBreakdown: "තාක්ෂණික දෝෂ (කණ්ඩායම පිටත්ව ඇත)",
      legendRestoring: "යථා තත්ත්වයට පත් කරමින් පවතී",
      interactiveNotice: "OpenStreetMap සහ Leaflet සඳහා සකස් කළ අන්තර්ක්‍රියාකාරී සිතියම් පද්ධතිය.",
    },
    chatbot: {
      title: "ඊ.ඩී.එල් කෙයාර් සහයක",
      status: "සක්‍රියයි • AI සහය සූදානම්",
      welcomeMsg: "ආයුබෝවන්! මම ඔබගේ EDL Care AI සහයකයා වෙමි. අද මම ඔබට උදව් කරන්නේ කෙසේද?",
      guestWelcomeMsg: "ආයුබෝවන්! මම අමුත්තන්ගේ මාදිලියේ (Guest Mode) සිටින EDL Care සහයකයා වෙමි. පොදු විදුලි ගාස්තු, ආරක්ෂිත මාර්ගෝපදේශ සහ ඇනහිටීම් පිළිබඳ විස්තර ලබාදිය හැක. පෞද්ගලික බිල්පත් බැලීමට ප්‍රවිෂ්ට වන්න.",
      customerWelcomeMsg: "ආයුබෝවන් දසුනි! මම ඔබගේ පාරිභෝගික මාදිලියේ (Customer Mode) EDL Care සහයකයා වෙමි. ගිණුම් අංක 0412345678 සම්බන්ධයි. ඔබගේ බිල්පත්, භාවිතය හෝ පැමිණිලි පිළිබඳව කුමක් දැනගැනීමට කැමතිද?",
      inputPlaceholder: "ඔබගේ ගැටලුව සිංහල, ඉංග්‍රීසි හෝ දෙමළ බසින් ලියන්න...",
      send: "යවන්න",
      typing: "EDL සහයක පිළිතුර සකස් කරමින් සිටී...",
      disclaimer: "ආදර්ශන සහයක: Gemini & RAG තාක්ෂණය මගින් බලගැන්වෙන ආදර්ශන පිළිතුරු.",
      suggestedQuestionsTitle: "යෝජිත ප්‍රශ්න",
      guestModeLabel: "අමුත්තන්ගේ මාදිලිය (Guest)",
      customerModeLabel: "පාරිභෝගික මාදිලිය (Customer)",
      guestModeDesc: "පොදු තොරතුරු • ප්‍රවිෂ්ට වීම අවශ්‍ය නොවේ",
      customerModeDesc: "තහවුරු කළ ගිණුම: #0412345678",
      switchModeNotice: "Guest සහ Customer මාදිලි අතර මාරුවී අත්හදා බලන්න.",
      viewFeatureMatrix: "හැකියා සංසන්දනය",
      loginRequiredMsg: "🔒 ප්‍රවිෂ්ට වීම අවශ්‍යයි: අමුත්තන්ගේ මාදිලියේදී පෞද්ගලික බිල්පත් සහ ගිණුම් තොරතුරු ආරක්ෂා කර ඇත. ඔබගේ ගෙවිය යුතු ශේෂය සහ පැමිණිලි බැලීමට කරුණාකර ප්‍රවිෂ්ට වන්න.",
      quickReplies: {
        highBill: "මගේ විදුලි බිල වැඩි වී ඇත්තේ ඇයි?",
        outageArea: "මගේ ප්‍රදේශයේ විදුලිය ඇනහිටීමක් තිබේද?",
        reportBreakdown: "විදුලි බිඳවැටීමක් වාර්තා කරන්නේ කෙසේද?",
        solarCapacity: "සූර්ය ට්‍රාන්ස්ෆෝමර් ධාරිතාව පරීක්ෂා කරන්නේ කෙසේද?",
        understandBill: "විදුලි බිල තේරුම් ගන්නේ කෙසේද?",
        tariffExpl: "ගෘහස්ථ විදුලි ගාස්තු ක්‍රමය පැහැදිලි කරන්න",
        safetyGuide: "අත්‍යවශ්‍ය විදුලි ආරක්ෂණ උපදෙස් මොනවාද?",
        generalOutage: "සැලසුම් කළ විදුලි නඩත්තු සිදුවන්නේ කෙසේද?",
        guestBillCheck: "මගේ ගෙවිය යුතු බිල කීයද? (Login පරීක්ෂාව)",
        myBill: "මගේ ගෙවිය යුතු බිල්පත් ශේෂය කීයද?",
        myConsumption: "ඔක්තෝබර් 2026 විදුලි භාවිතය පෙන්වන්න",
        trackComplaint: "මගේ විදුලි දෝෂ පැමිණිල්ලේ තත්ත්වය",
        mySolar: "මගේ ප්‍රදේශයේ සූර්ය බල ධාරිතාව පරීක්ෂා කරන්න",
      },
      mockAnswers: {
        highBill: "ඔබගේ ඔක්තෝබර් මාසයේ විදුලි භාවිතය ඒකක 154ක් වන අතර මාස 6ක සාමාන්‍යය ඒකක 138කි. ගෘහස්ථ කාණ්ඩයේ ඒකක 120 ඉක්මවීම හේතුවෙන් ඉහළ ගාස්තු පියවරකට ඇතුළත් වීම සහ අධික විදුලි උපකරණ (වායුසමීකරණ/ජල තාපක) භාවිතය මීට හේතු විය හැක.",
        outageArea: "ගිණුම් අංක 0412345678 (කොළඹ 05) ප්‍රදේශයේ පවතින වැසි සහිත කාලගුණය හේතුවෙන් F-04 හැව්ලොක් ෆීඩරයේ හදිසි දෝෂයක් වාර්තා වී ඇත. අපගේ කාර්මික කණ්ඩායම එම ස්ථානයේ කටයුතු කරන අතර අද පස්වරු 02:30 වන විට යථා තත්ත්වයට පත් කිරීමට නියමිතයි.",
        reportBreakdown: "විදුලි බිඳවැටීමක් වාර්තා කිරීමට පාලක පුවරුවේ ඇති 'දැන් වාර්තා කරන්න' බොත්තම ඔබන්න, නැතහොත් ඔබගේ ඉලක්කම් 10 ක ගිණුම් අංකය සහ ගැටලුව මෙහි සඳහන් කරන්න. හදිසි අනතුරකදී 1987 ක්ෂණික ඇමතුම් අංකය අමතන්න.",
        solarCapacity: "සූර්ය බල පද්ධති සම්බන්ධතා සඳහා ඔබගේ කලාපයේ (කොළඹ 05 / F-04) ට්‍රාන්ස්ෆෝමරයේ දැනට 35 kVA අතිරික්ත ධාරිතාවක් පවතී. අපගේ සූර්ය බල සේවා අංශය හරහා අයදුම්පතක් ඉදිරිපත් කළ හැක.",
        defaultFallback: "EDL Care සහයක හා සම්බන්ධ වීම ගැන ස්තූතියි. ඔබගේ විමසුම ලියාපදිංචි කර ඇත. හදිසි විදුලි උපද්‍රව සඳහා කරුණාකර 1987 අමතන්න.",
        understandBill: "විදුලි බිල්පත් ගණනය කිරීම, ඒකක භාවිතය සහ අදාළ ගාස්තු ක්‍රම තේරුම් ගැනීමට මට උදව් කළ හැක. ශ්‍රී ලංකාවේ ගෘහස්ථ බිල්පත (1) ඒකක අනුව බලශක්ති ගාස්තුව, (2) ස්ථාවර සේවා ගාස්තුව සහ (3) ඉන්ධන ගැලපුම් ගාස්තුවෙන් සමන්විත වේ. ආදර්ශන බිල්පතක් පරීක්ෂා කිරීමට කැමතිද?",
        tariffExpl: "ගෘහස්ථ විදුලි ගාස්තු දින 30ක ඒකක කාණ්ඩ මත පදනම් වේ: ඒකක 0–30 (අඩුම සහනාධාර ගාස්තුව), 31–60, 61–90, 91–120, සහ 120ට වැඩි. මාසික භාවිතය ඒකක 60ට අඩුවෙන් තබා ගැනීමෙන් උපරිම සහනාධාර හිමිවේ.",
        safetyGuide: "අත්‍යවශ්‍ය ආරක්ෂක උපදෙස්: (1) මසකට වරක් ඔබගේ ට්‍රිප් ස්විචය (ELCB) පරීක්ෂා කරන්න, (2) තෙතමනය සහිත දෑතින් විදුලි ස්විච අල්ලන්න එපා, (3) ප්‍රධාන විදුලි රැහැන්වලට මීටර් 3ක පරතරයක් තබාගන්න, (4) කැඩී වැටුණු වයර් දුටු වහාම 1987 අමතන්න.",
        generalOutage: "ගස් කප්පාදු කිරීම, රැහැන් නඩත්තුව සහ ට්‍රාන්ස්ෆෝමර් පරීක්ෂාව සඳහා සැලසුම් කළ නඩත්තු සිදු කෙරේ. මේ පිළිබඳව පැය 48කට පෙර දැනුම්දීම් නිකුත් කෙරේ.",
        guestBillCheck: "🔒 ප්‍රවිෂ්ට වීම අවශ්‍යයි: ඔබ දැනට අමුත්තන්ගේ මාදිලියේ (Guest Mode) සිටී. පෞද්ගලික මූල්‍ය දත්ත ආරක්ෂා කිරීම සඳහා බිල්පත් ශේෂයන් දැකගත හැක්කේ ප්‍රවිෂ්ට වූ පාරිභෝගිකයින්ට පමණි. කරුණාකර ප්‍රවිෂ්ට වන්න.",
        myBill: "ඔබගේ ආදර්ශන ගිණුමේ (#0412345678 – නිවස) ඔක්තෝබර් 2026 සඳහා ගෙවිය යුතු ශේෂය රු. 4,850.00 කි. ගෙවිය යුතු අවසන් දිනය 2026 නොවැම්බර් 25 වේ. දැන්ම ඔන්ලයින් ගෙවීමට කැමතිද?",
        myConsumption: "2026 ඔක්තෝබර් මාසයේදී ඔබගේ පරිභෝජනය ඒකක 142කි (සැප්තැම්බර් මාසයට වඩා 11.2%ක අඩුවීමක්). මාස 6ක සාමාන්‍යය ඒකක 154කි.",
        trackComplaint: "2026 නොවැම්බර් 12 දින යොමුකළ පැමිණිලි අංක #REF-2026-9841 ('වහල අසල සේවා රැහැනේ ගිනි පුපුරු') දැනට විසඳමින් පවතී (IN PROGRESS). කොළඹ දකුණ කාර්මික අංශය පවරා ඇත.",
        mySolar: "ඔබ සම්බන්ධ වී ඇති බෙදාහැරීමේ ට්‍රාන්ස්ෆෝමරයේ (TR-402, නුගේගොඩ) වහල මත සූර්ය පද්ධති සඳහා 42 kW අතිරික්ත ධාරිතාවක් පවතී.",
      },
    },
  },
  ta: {
    brandName: "ஈ.டி.எல் கேர் உதவியாளர்",
    brandSubtitle: "இலங்கை மின்சார விநியோகம்",
    demoNotice: "செயல்விளக்க மாதிரி – மாதிரி தரவு",
    fictionalDataBanner: "அறிவிப்பு: இது ஒரு சுயாதீன செயல்விளக்க முன்மாதிரி ஆகும். அனைத்து வாடிக்கையாளர் பதிவுகள் மற்றும் மின்தடை விவரங்களும் மாதிரிக்கு மட்டுமே.",
    nav: {
      dashboard: "டாஷ்போர்டு",
      myAccount: "எனது கணக்கு",
      bills: "மின் கட்டணங்கள்",
      consumption: "மின் நுகர்வு",
      outageMap: "மின்தடை வரைபடம்",
      complaints: "புகார்கள்",
      aiAssistant: "AI உதவியாளர்",
      settings: "அமைப்புகள்",
    },
    header: {
      notifications: "அறிவிப்புகள்",
      profile: "சுயவிவரம்",
      toggleTheme: "தீம் மாற்றவும்",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
      searchPlaceholder: "கணக்கு எண், கட்டணம் அல்லது சேவைகளைத் தேடுங்கள்...",
    },
    accountCard: {
      title: "கணக்கு சுருக்கம்",
      accountNumber: "கணக்கு எண்",
      nickname: "வளாகத்தின் பெயர்",
      billingMonth: "கட்டண மாதம்",
      outstandingBalance: "நிலுவைத் தொகை",
      dueDate: "செலுத்த வேண்டிய இறுதித் திகதி",
      billDetails: "கட்டண விவரங்கள்",
      payNow: "இப்போது செலுத்துங்கள்",
      tariff: "கட்டணப் பிரிவு",
      paymentSuccess: "மாதிரி கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது!",
      paymentModalTitle: "மாதிரி மின் கட்டண செலுத்துகை",
      billModalTitle: "மின் கட்டண விவரம் (டெமோ)",
      close: "மூடு",
      proceedPayment: "அட்டையூடாக செலுத்த (Demo)",
    },
    usageCard: {
      title: "மாதாந்திர மின் நுகர்வு",
      subtitle: "கிலோவாட் மணிநேரத்தில் (kWh) 6 மாத மின் நுகர்வு வரலாறு",
      unitsConsumed: "பயன்படுத்தப்பட்ட அலகுகள்",
      estimatedCost: "கட்டணத் தொகை",
      averageUnits: "மாதாந்திர சராசரி",
      compareLastMonth: "கடந்த மாதத்துடன் ஒப்பிடும்போது +8.4% அதிகரிப்பு",
      kwh: "kWh",
    },
    outageCard: {
      title: "மின் தடை ஏற்பட்டுள்ளதா?",
      description: "மின் தடங்கல்கள் உள்ளதா? நேரடி நிலவரத்தை சரிபார்க்கவும் அல்லது எமது 24/7 தொழில்நுட்ப குழுவுக்கு உடனடியாக புகாரளிக்கவும்.",
      reportNow: "இப்போது புகாரளிக்கவும்",
      viewMap: "வரைபடத்தைப் பார்க்கவும்",
      statusNormal: "உங்கள் பகுதியில் மின்சார விநியோகம் வழமையாக உள்ளது",
      activeNotice: "கொழும்பு மற்றும் கண்டி பகுதிகளில் பராமரிப்பு குழுக்கள் பணியில் உள்ளன.",
    },
    quickServices: {
      title: "விரைவான சேவைகள்",
      viewBill: "மின் கட்டணத்தைப் பார்க்க",
      viewBillDesc: "கட்டணத்தைப் பதிவிறக்கவும் மற்றும் மீட்டர் வாசிப்பைச் சரிபார்க்கவும்",
      checkOutage: "மின்தடை சோதனை",
      checkOutageDesc: "கணக்கு எண் அல்லது மின்மாற்றி குறியீடு மூலம் தேடவும்",
      reportBreakdown: "மின்தடையைப் புகாரளிக்க",
      reportBreakdownDesc: "மின்சாரக் கம்பி கோளாறு அல்லது அவசர நிலையை அறிவிக்கவும்",
      solarServices: "சூரிய சக்தி சேவைகள்",
      solarServicesDesc: "சூரிய சக்தி இணைப்பு மற்றும் மின்மாற்றி திறன் விவரங்கள்",
    },
    outageMapPage: {
      title: "மின்தடை வரைபடம் & மின் கட்டமைப்பு கண்காணிப்பு",
      subtitle: "இலங்கை முழுவதிலும் திட்டமிடப்பட்ட பராமரிப்பு மற்றும் அவசர மின்தடைகளை நேரடியாக கண்காணிக்கவும்.",
      searchLocation: "மாகாணம், மாவட்டம் அல்லது நகரத்தைத் தேடுங்கள்...",
      allProvinces: "அனைத்து மாகாணங்கள்",
      allDistricts: "அனைத்து மாவட்டங்கள்",
      filterAll: "அனைத்து மின்தடைகள்",
      filterPlanned: "திட்டமிடப்பட்ட பராமரிப்பு",
      filterBreakdown: "அவசர மின்தடைகள்",
      plannedOutages: "திட்டமிடப்பட்ட பராமரிப்பு",
      activeBreakdowns: "அவசர மின்தடைகள்",
      affectedPremises: "பாதிக்கப்பட்ட நுகர்வோர்",
      estimatedRestoration: "மீட்டமைக்கப்படும் உத்தேச நேரம்",
      feeder: "துணை மின்நிலையம் / பீடர்",
      reason: "காரணம்",
      reportBreakdownBtn: "புதிய மின்தடையைப் புகாரளிக்க",
      refreshData: "நிலவரத்தைப் புதுப்பிக்க",
      mapLegend: "வரைபடக் குறியீடுகள்",
      legendPlanned: "திட்டமிடப்பட்ட பராமரிப்பு",
      legendBreakdown: "தொழில்நுட்பக் கோளாறு (குழு பணியில் உள்ளது)",
      legendRestoring: "மீட்டமைக்கும் பணி நடைபெறுகிறது",
      interactiveNotice: "OpenStreetMap மற்றும் Leaflet இணைப்புக்காக வடிவமைக்கப்பட்ட வரைபடப் பகுதி.",
    },
    chatbot: {
      title: "ஈ.டி.எல் கேர் உதவியாளர்",
      status: "இணைப்பில் உள்ளது • AI தயார்",
      welcomeMsg: "வணக்கம்! நான் உங்கள் EDL Care AI உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு உதவலாம்?",
      guestWelcomeMsg: "வணக்கம்! நான் விருந்தினர் பயன்முறையில் (Guest Mode) உள்ள EDL Care உதவியாளர். பொதுவான மின் கட்டண முறைகள், பாதுகாப்பு வழிமுறைகள் மற்றும் மின்தடை விபரங்களை வழங்க முடியும். தனிப்பயனாக்கப்பட்ட கட்டண விவரங்களைப் பெற உள்நுழையவும்.",
      customerWelcomeMsg: "வணக்கம் தசுனி! நான் உங்கள் வாடிக்கையாளர் பயன்முறையில் (Customer Mode) உள்ள EDL Care உதவியாளர். கணக்கு #0412345678 இணைக்கப்பட்டுள்ளது. உங்கள் கட்டணங்கள் அல்லது புகார்கள் குறித்து எவ்வாறு உதவலாம்?",
      inputPlaceholder: "உங்கள் கேள்வியை தமிழ், சிங்களம் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்...",
      send: "அனுப்பு",
      typing: "EDL உதவியாளர் பதிலைத் தயாரிக்கிறார்...",
      disclaimer: "டெமோ உதவியாளர்: Gemini & RAG தொழில்நுட்பத்தால் இயக்கப்படும் மாதிரி பதில்கள்.",
      suggestedQuestionsTitle: "பரிந்துரைக்கப்பட்ட கேள்விகள்",
      guestModeLabel: "விருந்தினர் பயன்முறை (Guest)",
      customerModeLabel: "வாடிக்கையாளர் பயன்முறை (Customer)",
      guestModeDesc: "பொதுத் தகவல் • உள்நுழைவு தேவையில்லை",
      customerModeDesc: "சரிபார்க்கப்பட்ட கணக்கு: #0412345678",
      switchModeNotice: "Guest மற்றும் Customer பயன்முறைகளை மாற்றி சோதிக்கவும்.",
      viewFeatureMatrix: "அம்சங்களை ஒப்பிடுக",
      loginRequiredMsg: "🔒 உள்நுழைவு தேவை: விருந்தினர் பயன்முறையில் தனிப்பட்ட மின்கட்டண விபரங்கள் பாதுகாக்கப்படுகின்றன. நிலுவைத் தொகை மற்றும் புகார்களைப் பார்க்க தயவுசெய்து உள்நுழையவும்.",
      quickReplies: {
        highBill: "எனது மின் கட்டணம் அதிகமாக இருப்பது ஏன்?",
        outageArea: "எனது பகுதியில் மின்தடை உள்ளதா?",
        reportBreakdown: "மின்தடையை எவ்வாறு புகாரளிப்பது?",
        solarCapacity: "சூரிய மின்மாற்றி திறனை எவ்வாறு சரிபார்ப்பது?",
        understandBill: "மின் கட்டணத்தை எவ்வாறு புரிந்துகொள்வது?",
        tariffExpl: "வீட்டு மின் கட்டண முறையை விளக்குக",
        safetyGuide: "அத்தியாவசிய மின் பாதுகாப்பு குறிப்புகள் யாவை?",
        generalOutage: "திட்டமிடப்பட்ட மின்தடை பராமரிப்பு எவ்வாறு செயல்படுகிறது?",
        guestBillCheck: "எனது நிலுவைக் கட்டணம் எவ்வளவு? (Login சோதனை)",
        myBill: "எனது நிலுவைக் கட்டணம் எவ்வளவு?",
        myConsumption: "அக்டோபர் 2026 மின் நுகர்வைக் காட்டு",
        trackComplaint: "எனது மின்தடை புகாரின் நிலை",
        mySolar: "எனது பகுதிக்கான சூரிய மின்மாற்றி திறன்",
      },
      mockAnswers: {
        highBill: "உங்கள் அக்டோபர் மாத மின் நுகர்வு 154 அலகுகளாகும், உங்கள் 6 மாத சராசரி 138 அலகுகள் ஆகும். 120 அலகுகளுக்கு மேல் பயன்பாடு அதிகரிக்கும் போது கட்டண அடுக்கு மாறுவது மற்றும் அதிக மின் சாதனங்களின் பயன்பாடு இதற்கு காரணமாக இருக்கலாம்.",
        outageArea: "கணக்கு #0412345678 (கொழும்பு 05) பகுதிக்கு, கடும் மழை காரணமாக F-04 ஹேவ்லாக் பீடரில் அவசர கோளாறு ஏற்பட்டுள்ளது. எமது தொழில்நுட்ப குழுவினர் பணியில் ஈடுபட்டுள்ளனர், இன்று மதியம் 02:30 மணிக்கு மின்சாரம் மீட்டமைக்கப்படும் என எதிர்பார்க்கப்படுகிறது.",
        reportBreakdown: "மின்தடையைப் புகாரளிக்க டாஷ்போர்டில் உள்ள 'இப்போது புகாரளிக்கவும்' பொத்தானைக் கிளிக் செய்யவும் அல்லது உங்கள் 10 இலக்க கணக்கு எண்ணையும் கோளாறையும் இங்கு பதிவிடவும். அவசர ஆபத்துகளுக்கு 1987 அவசர தொலைபேசியை உடனடியாக அழைக்கவும்.",
        solarCapacity: "உங்கள் பகுதியில் (கொழும்பு 05 / F-04) கூரை சூரிய சக்தி அமைப்பிற்கு தற்போது 35 kVA கூடுதல் மின்மாற்றி திறன் உள்ளது. எங்கள் சூரிய சக்தி சேவை போர்டல் மூலம் விண்ணப்பிக்கலாம்.",
        defaultFallback: "EDL Care உதவியாளரைத் தொடர்பு கொண்டதற்கு நன்றி. அவசர மின் ஆபத்துகளுக்கு 1987 என்ற அவசர தொலைபேசி எண்ணை அழைக்கவும்.",
        understandBill: "மின் கட்டணக் கணக்கீடு, நுகர்வு அலகுகள் மற்றும் பொருந்தக்கூடிய கட்டண முறைகளைப் புரிந்துகொள்ள உதவ முடியும். இலங்கையில் உள்நாட்டு கட்டணங்கள் (1) அலகுக்கான மின் கட்டணம், (2) நிலையான சேவைக் கட்டணம் மற்றும் (3) எரிபொருள் சரிசெய்தல் கட்டணம் ஆகியவற்றைக் கொண்டுள்ளது. மாதிரி கட்டணத்தைப் பார்க்க விரும்புகிறீர்களா?",
        tariffExpl: "வீட்டு மின் கட்டணங்கள் 30 நாள் அடுக்கு முறையைக் கொண்டுள்ளன: 0–30 அலகுகள் (குறைந்த மானியக் கட்டணம்), 31–60, 61–90, 91–120 மற்றும் 120 அலகுகளுக்கு மேல். 60 அலகுகளுக்குக் குறைவாக வைத்திருப்பதன் மூலம் மானியக் கட்டணங்களைப் பெறலாம்.",
        safetyGuide: "அத்தியாவசிய பாதுகாப்பு வழிகாட்டல்: (1) மாதந்தோறும் டிரிப் சுவிட்சை (ELCB) சோதிக்கவும், (2) ஈரமான கைகளால் சுவிட்சைத் தொடாதீர்கள், (3) பிரதான மின்கம்பிகளுக்கு 3 மீட்டர் இடைவெளி விடவும், (4) உடைந்த கம்பிகளைக் கண்டால் உடனடியாக 1987 ஐ அழைக்கவும்.",
        generalOutage: "மரக்கிளைகளை வெட்டுதல், மின் இணைப்புகளைப் புதுப்பித்தல் மற்றும் மின்மாற்றி பராமரிப்பிற்காக திட்டமிடப்பட்ட பராமரிப்பு மேற்கொள்ளப்படுகிறது. 48 மணி நேரத்திற்கு முன்பே அறிவிப்புகள் வெளியிடப்படும்.",
        guestBillCheck: "🔒 உள்நுழைவு தேவை: நீங்கள் தற்போது விருந்தினர் பயன்முறையில் (Guest Mode) உள்ளீர்கள். தனிப்பட்ட நிதித் தரவைப் பாதுகாக்க, பதிவுசெய்த வாடிக்கையாளர்களுக்கு மட்டுமே கட்டண விவரங்கள் காண்பிக்கப்படும். கணக்கு #0412345678 ஐப் பார்க்க உள்நுழையவும்.",
        myBill: "உங்கள் டெமோ கணக்கில் (#0412345678 – வீடு) அக்டோபர் 2026க்கான நிலுவைத் தொகை ரூ. 4,850.00 ஆகும். செலுத்த வேண்டிய இறுதி தேதி 25 நவம்பர் 2026. ஆன்லைனில் உடனடியாக செலுத்த விரும்புகிறீர்களா?",
        myConsumption: "அக்டோபர் 2026 இல், உங்கள் மின் நுகர்வு 142 kWh ஆகும் (செப்டம்பர் மாதத்தை விட 11.2% குறைவு). உங்கள் 6 மாத சராசரி 154 kWh ஆகும்.",
        trackComplaint: "12 நவம்பர் 2026 அன்று பதிவு செய்யப்பட்ட புகார் #REF-2026-9841 ('கூரை அருகில் உள்ள சர்வீஸ் வயரில் தீப்பொறி') தற்போது செயல்பாட்டில் உள்ளது (IN PROGRESS). கொழும்பு தெற்கு பிரிவு ஒதுக்கப்பட்டுள்ளது.",
        mySolar: "உங்கள் விநியோக மின்மாற்றியில் (TR-402, நுகேகொட / பீடர் F-04) கூரை சூரிய மின் உற்பத்திக்காக 42 kW மீதமுள்ள திறன் உள்ளது.",
      },
    },
  },
};
