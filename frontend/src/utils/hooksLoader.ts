import hooksData from '../data/hooks.json';

interface HookData {
  HookSignature: string;
  MethodSignature: string;
  MethodSourseCode: string;
  ClassName: string;
  HookLineInvoke: number;
}

class HooksLoader {
  private static hooks: HookData[] = hooksData;
  
  static getHookNames(): string[] {
    return this.hooks.map(hook => {
      const match = hook.HookSignature.match(/^(\w+)\(/);
      return match ? match[1] : hook.HookSignature;
    });
  }
  
  static getHookByName(name: string): HookData | undefined {
    return this.hooks.find(hook => {
      const match = hook.HookSignature.match(/^(\w+)\(/);
      const hookName = match ? match[1] : hook.HookSignature;
      return hookName === name;
    });
  }
  
  static getAllHooks(): HookData[] {
    return this.hooks;
  }
  
  static searchHooks(query: string): HookData[] {
    const lowerQuery = query.toLowerCase();
    return this.hooks.filter(hook => {
      const hookName = hook.HookSignature.match(/^(\w+)\(/)?.[1] || hook.HookSignature;
      return hookName.toLowerCase().includes(lowerQuery) ||
             hook.MethodSignature.toLowerCase().includes(lowerQuery) ||
             hook.ClassName.toLowerCase().includes(lowerQuery);
    });
  }
}

export default HooksLoader;
export type { HookData };