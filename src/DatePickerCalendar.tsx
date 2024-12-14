import { exists } from "./Box/BoxUtils";
import {
  useProp,
  Prop,
  useFormula,
  doNow,
  Column,
  Row,
  Box,
  Txt,
  Icon,
  ReadonlyProp,
  theme,
} from "./miwi";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { For } from "solid-js";

export function DatePickerCalendar(props: {
  selectedDateMs: Prop<number | null>;
  onSelect?: (date: Date | null) => void;
}) {
  const selectedDate = useFormula(
    () => {
      if (props.selectedDateMs.value === null) return null;
      return new Date(props.selectedDateMs.value);
    },
    (newDate) => {
      const newDateAtNoon = doNow(() => {
        if (newDate === null) return null;
        const atNoon = new Date(newDate.getTime());
        atNoon.setHours(12, 0, 0, 0);
        return atNoon;
      });
      props.selectedDateMs.value = newDateAtNoon?.getTime() ?? null;
      props.onSelect?.(newDateAtNoon);
    },
  );
  const todaysDate = new Date();
  const displayedMonth = useProp(selectedDate.value ?? todaysDate);
  const displayedMonthTitle = useFormula(() => {
    // Format like: Jan 2024
    return displayedMonth.value.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  });
  /** Figure out what days to display */
  const displayedDates: ReadonlyProp<Date[]> = useFormula(() => {
    const displayedDates: Date[] = [];

    /** If the first day of the month is not a Sunday, we need to go back to the previous
     * Sunday and display a few days from the previous month. */
    const firstDayOfMonth = doNow(() => {
      const firstDayOfMonth = new Date(displayedMonth.value.getTime());
      firstDayOfMonth.setDate(1);
      return firstDayOfMonth;
    });
    const numberOfDaysToDisplayFromPreviousMonth = firstDayOfMonth.getDay();
    for (let i = numberOfDaysToDisplayFromPreviousMonth; i > 0; i--) {
      const date = new Date(firstDayOfMonth.getTime());
      date.setDate(date.getDate() - i);
      displayedDates.push(date);
    }

    /** The next step iteratively adds to displayedDates. If we do this here it grantees there
     * is at least something in the list. */
    displayedDates.push(firstDayOfMonth);

    /** We always display five weeks, so we'll just keep going till we hit that point. */
    for (let i = displayedDates.length; i < 5 * 7; i++) {
      const date = new Date(
        displayedDates[displayedDates.length - 1]!.getTime(),
      );
      date.setDate(date.getDate() + 1);
      displayedDates.push(date);
    }

    // That should be everything we need.
    return displayedDates;
  });

  return (
    <Column padBetween={0.25}>
      {/* Month Header */}
      <Row asWideAsParent spaceBetween>
        <Icon
          icon={mdiChevronLeft}
          scale={1.425}
          onClick={() => {
            const newDate = new Date(displayedMonth.value.getTime());
            newDate.setMonth(newDate.getMonth() - 1);
            displayedMonth.value = newDate;
          }}
        />
        <Txt>{displayedMonthTitle.value}</Txt>
        <Icon
          icon={mdiChevronRight}
          scale={1.425}
          onClick={() => {
            const newDate = new Date(displayedMonth.value.getTime());
            newDate.setMonth(newDate.getMonth() + 1);
            displayedMonth.value = newDate;
          }}
        />
      </Row>

      {/* Weekday Headers */}
      <Row>
        {["S", "M", "T", "W", "T", "F", "S"].map((dayChar) => (
          <Box width={1.5} height={1.5}>
            <Txt bold>{dayChar}</Txt>
          </Box>
        ))}
      </Row>

      {/* Days of Month */}
      <For each={Array.from({ length: 5 }).map((x, i) => i)}>
        {(weekIndex) => (
          <Row>
            <For
              each={displayedDates.value.slice(
                weekIndex * 7,
                weekIndex * 7 + 7,
              )}
            >
              {(dayDate) => (
                <Box
                  width={1.5}
                  height={1.5}
                  outlineColor={
                    exists(selectedDate.value) &&
                    isSameDay(dayDate, selectedDate.value)
                      ? theme.palette.primary
                      : undefined
                  }
                  cornerRadius={0.25}
                  onClick={() =>
                    (selectedDate.value = new Date(dayDate.getTime()))
                  }
                  touchRadius={0.25}
                >
                  <Txt
                    hint={
                      dayDate.getMonth() !== displayedMonth.value.getMonth()
                    }
                    stroke={
                      isSameDay(dayDate, todaysDate) ||
                      (exists(selectedDate.value) &&
                        isSameDay(dayDate, selectedDate.value))
                        ? theme.palette.primary
                        : undefined
                    }
                  >
                    {dayDate.getDate()}
                  </Txt>
                </Box>
              )}
            </For>
          </Row>
        )}
      </For>
    </Column>
  );
}

export function isSameDay(firstDay: Date, ...otherDays: Date[]) {
  const allDays = [firstDay, ...otherDays];
  const daysAtNoonMs = allDays.map((day) => {
    const atNoon = new Date(day.getTime());
    atNoon.setHours(12, 0, 0, 0);
    return atNoon.getTime();
  });
  const firstDayAtNoonMs = daysAtNoonMs[0];
  return daysAtNoonMs.every((dayAtNoonMs) => dayAtNoonMs === firstDayAtNoonMs);
}
