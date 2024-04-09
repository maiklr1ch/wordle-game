
/*
* Returns maximum experience for given level<br/>
* 1 LVL = 8 EXP<br/>
* 2 LVL = 12 EXP<br/>
* 3 LVL = 16 EXP<br/>
* etc
* */
export const getMaxLevelExp = (n: number) => 4 + n * 4;
