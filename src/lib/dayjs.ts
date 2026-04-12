import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('es');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);

export default dayjs;
