// init 먼저 실행 후 bootstrap 실행 (순차적)
import('./init').then(() => import('./bootstrap'))

export {}
