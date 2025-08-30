import { GoogleGenAI, Type } from "@google/genai";
import type { WeeklySchedule } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.ARRAY,
      description: "آرایه‌ای از برنامه‌های روزانه برای ۷ روز. روز اول باید امروز باشد.",
      items: {
        type: Type.OBJECT,
        required: ["dayName", "jalaliDate", "tasks", "totalMinutes", "motivationalTip"],
        properties: {
          dayName: { type: Type.STRING, description: "نام روز هفته به فارسی (مثلاً 'شنبه')." },
          jalaliDate: { type: Type.STRING, description: "تاریخ کامل جلالی به فارسی (مثلاً '۱۴ اردیبهشت ۱۴۰۳')." },
          tasks: {
            type: Type.ARRAY,
            description: "لیست وظایف برای این روز.",
            items: {
              type: Type.OBJECT,
              required: ["startTime", "endTime", "title", "isDeepWork"],
              properties: {
                startTime: { type: Type.STRING, description: "زمان شروع با فرمت HH:MM (مثلاً '10:00')." },
                endTime: { type: Type.STRING, description: "زمان پایان با فرمت HH:MM (مثلاً '12:00')." },
                title: { type: Type.STRING, description: "عنوان وظیفه به فارسی." },
                isDeepWork: { type: Type.BOOLEAN, description: "مشخص می‌کند که آیا این یک وظیفه کار عمیق است یا نه." }
              }
            }
          },
          totalMinutes: { type: Type.INTEGER, description: "مجموع دقایق برنامه‌ریزی شده برای این روز." },
          motivationalTip: { type: Type.STRING, description: "یک نکته انگیزشی کوتاه و مرتبط با روز به فارسی." }
        }
      }
    },
    deferredTasks: {
      type: Type.ARRAY,
      description: "لیستی از وظایفی که قابل برنامه‌ریزی نبودند.",
      items: {
        type: Type.OBJECT,
        required: ["title", "reason"],
        properties: {
          title: { type: Type.STRING, description: "عنوان وظیفه معوق." },
          reason: { type: Type.STRING, description: "دلیل معوق شدن وظیفه به فارسی." }
        }
      }
    },
    notesAndSuggestions: {
      type: Type.STRING,
      description: "یادداشت‌ها و پیشنهادات کلی برای بهبود برنامه به فارسی."
    }
  }
};


const SYSTEM_PROMPT = `
شما "برنامه‌ریز حرفه‌ای جلالی" هستید، یک دستیار هوشمند برای برنامه‌ریزی هفتگی. تمام ورودی‌ها و خروجی‌های شما باید فقط به زبان فارسی و با استفاده انحصاری از تقویم جلالی باشد. هرگز از تاریخ میلادی استفاده نکنید.

**قوانین اصلی شما:**
۱.  **تقویم و زبان:** فقط فارسی و جلالی. امروز را به عنوان روز اول هفته در نظر بگیرید و برای ۷ روز آینده برنامه‌ریزی کنید.
۲.  **تحلیل ورودی:** ورودی کاربر را که به زبان طبیعی فارسی است تحلیل کنید تا وظایف، مدت زمان، اولویت، مهلت و زمان‌های ثابت را استخراج کنید.
۳.  **کارهای ثابت:** کاربر ممکن است لیستی از کارهای ثابت با زمان و روز مشخص ارائه دهد. این وظایف باید دقیقاً در همان زمان‌ها قرار گیرند و وظایف انعطاف‌پذیر باید حول آن‌ها برنامه‌ریزی شوند. این کارها اولویت مطلق دارند و نباید جابجا شوند.
۴.  **زمان بافر:** برای هر وظیفه انعطاف‌پذیر ۱۰ تا ۱۵ درصد زمان بافر برای واقع‌گرایانه‌تر شدن برنامه اضافه کنید.
۵.  **توزیع بار کاری:** کارها را به طور متعادل در طول هفته پخش کنید. از انباشت کار در یک روز جلوگیری کنید. حداکثر ۶ ساعت کار در روز برنامه‌ریزی کنید.
۶.  **انرژی کاربر:** وظایف نیازمند "کار عمیق" (مانند نوشتن، کدنویسی) را در ساعات اوج انرژی (۹ تا ۱۲ صبح) و کارهای سبک (ایمیل، جلسات کوتاه) را در ساعات کم انرژی (بعد از ظهر) قرار دهید.
۷.  **تقسیم وظایف:** وظایف طولانی را فقط در صورت لزوم تقسیم کنید و هر بخش نباید کمتر از ۴۵ دقیقه باشد.
۸.  **روزهای تعطیل:** در روزهای تعطیل یا سبک (مانند جمعه‌ها) فقط کارهای سبک و کوتاه قرار دهید، مگر اینکه مهلت فوری وجود داشته باشد.
۹.  **کارهای معوق:** اگر وظیفه‌ای به دلیل محدودیت‌ها قابل برنامه‌ریزی نیست، آن را در لیست "کارهای معوق" با ذکر دلیل قرار دهید.
۱۰. **اولویت‌بندی:** ترتیب اهمیت برای کارهای انعطاف‌پذیر: ۱) مهلت‌ها، ۲) اولویت مشخص شده توسط کاربر، ۳) بازدهی (اولویت تقسیم بر مدت زمان).
۱۱. **خروجی:** خروجی شما باید یک شیء JSON معتبر باشد که دقیقاً با اسکیمای ارائه شده مطابقت دارد. هیچ متنی قبل یا بعد از JSON اضافه نکنید.
`;

export const generateSchedule = async (userInput: string): Promise<WeeklySchedule> => {
  const model = 'gemini-2.5-flash';
  
  const response = await ai.models.generateContent({
    model,
    contents: userInput,
    config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
    }
  });

  const rawJson = response.text.trim();
  const parsedResponse = JSON.parse(rawJson);
  
  // Add isCompleted property to each task
  const processedPlan = parsedResponse.weeklyPlan.map((day: any) => ({
    ...day,
    tasks: day.tasks.map((task: any) => ({
      ...task,
      isCompleted: false,
    })),
  }));

  return { ...parsedResponse, weeklyPlan: processedPlan };
};
