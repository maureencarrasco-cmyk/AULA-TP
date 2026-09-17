'use strict';
const courseResume = {
  key() { return `aulatp:position:v1:${auth.user.id}:${current.id}`; },
  enabled() { return auth.user?.role === 'student' && current && !current.state.closed; },
  read() {
    if (!this.enabled()) return null;
    try {
      const p = JSON.parse(localStorage.getItem(this.key()));
      return p && Number.isInteger(p.station) && p.station >= 1 && p.station <= 5 ? p : null;
    } catch { return null; }
  },
  station(fallback) {
    const p = this.read();
    return p && !current.completed[p.station-1] && stationUnlocked(p.station) ? p.station : fallback;
  },
  save(n) {
    if (!this.enabled()) return;
    try {
      localStorage.setItem(this.key(), JSON.stringify({station:n, ae, step, caseIndex, tab, examStarted, questionIndex}));
    } catch { /* Remembering a position is optional; activities remain available. */ }
  },
  restore(n) {
    const p = this.read();
    if (!p || p.station !== n || !stationUnlocked(n)) return;
    const inRange = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
    if (n === 2 && inRange(p.ae,2) && inRange(p.step,5)) {
      const index = p.ae*6+p.step;
      const accessible = Array.from({length:index},(_,i)=>current.state.ae[`${Math.floor(i/6)}-${i%6}`]).every(Boolean);
      if (accessible) { ae=p.ae; step=p.step; }
    }
    if (n === 3) {
      if (inRange(p.caseIndex,14) && Array.from({length:p.caseIndex},(_,i)=>current.state.cases[i]).every(Boolean)) caseIndex=p.caseIndex;
      if (['cases','scene'].includes(p.tab)) tab=p.tab;
    }
    if (n === 4 && !current.state.exam) {
      if (inRange(p.questionIndex,24)) questionIndex=p.questionIndex;
      if (['questions','development'].includes(p.tab)) tab=p.tab;
      examStarted=p.examStarted === true;
    }
  }
};
