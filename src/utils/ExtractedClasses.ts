import { findModule } from "decky-frontend-lib";

export default class ExtractedClasses {

  private static instance: ExtractedClasses;

  public found: Record<string, string> = {};

  private constructor() {

    const mod1 = findModule((mod) => {
      if (typeof mod !== 'object') return false;
    
      if (mod.EventPreviewOuterWrapper && mod.LibraryHomeWhatsNew) {
        return true;
      }
  
      return false;
    });
    
    const mod2 = findModule((mod) => {
      if (typeof mod !== 'object') return false;
  
      if(mod.DateToolTip) {
        return true;
      }
  
      return false;
    });
  
    const mod3 = findModule((mod) => {
      if (typeof mod !== 'object') return false;
  
      if(mod.LunarNewYearOpenEnvelopeVideoDialog) {
        return true;
      }
  
      return false;
    });

    this.found = { ...mod3, ...mod2, ...mod1 };

  }

  public static getInstance(): ExtractedClasses {
    if (!ExtractedClasses.instance) {
      ExtractedClasses.instance = new ExtractedClasses();
    }
    return ExtractedClasses.instance;
  }

}