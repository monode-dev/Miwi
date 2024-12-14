import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { Button } from "./Button";
import { DatePickerCalendar, isSameDay } from "./DatePickerCalendar";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { pushPage, popPage } from "./Nav";
import { Row } from "./Row";
import { Txt } from "./Txt";
import {Prop, useFormula, useProp} from "./miwi"

const oneDayInMs = 86400000;
export function getNoonTodayMs() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.getTime();
}

export function DayPickerHeader(props: {
  selectedDay?: Prop<number>;
}) {
  const selectedDay = props.selectedDay ?? useProp(getNoonTodayMs());
  const dayTitle = useFormula(() => getDateLabelForDayPickerHeader(selectedDay.value));
  return (
    <Row widthGrows spaceBetween>
    <Icon
      icon={mdiChevronLeft}
      scale={1.425}
      onClick={() => {
        const yesterday = new Date(selectedDay.value);
        yesterday.setDate(yesterday.getDate() - 1);
        selectedDay.value = yesterday.getTime();
      }}
    />
    <Txt
      onClick={() => {
        pushPage(
          () => (
            <Dialog>
              <DatePickerCalendar
                selectedDateMs={selectedDay}
                onSelect={() => popPage()}
              />
              <Button asWideAsParent onClick={() => popPage()} outlined>
                Cancel
              </Button>
            </Dialog>
          ),
          {},
        );
      }}
    >
      {dayTitle.value}
    </Txt>
    <Icon
      icon={mdiChevronRight}
      scale={1.425}
      onClick={() => {
        const tomorrow = new Date(selectedDay.value);
        tomorrow.setDate(tomorrow.getDate() + 1);
        selectedDay.value = tomorrow.getTime();
      }}
    />
  </Row>
  )
}

export function getDateLabelForDayPickerHeader(dayMs: number) {
  if (isSameDay(new Date(dayMs), new Date(getNoonTodayMs() - oneDayInMs))) {
    return `Yesterday`;
  } else if (isSameDay(new Date(dayMs), new Date())) {
    return `Today`;
  } else if (isSameDay(new Date(dayMs), new Date(getNoonTodayMs() + oneDayInMs))) {
    return `Tomorrow`;
  } else {
    // Date Like: Wed, Dec 11, 2024
    return new Date(dayMs).toLocaleDateString(`en-US`, {
      weekday: `short`,
      month: `short`,
      day: `numeric`,
      year: `numeric`,
    });
  }
}