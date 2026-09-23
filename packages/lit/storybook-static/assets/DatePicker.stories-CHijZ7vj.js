import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./DatePicker-BKUWdqvh.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;function A(){return(A=e((()=>{t(),r(),a(),o={title:`DatePicker/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{range:{control:`boolean`},open:{control:`boolean`},showWeekNumbers:{control:`boolean`},required:{control:`boolean`},hideLabel:{control:`boolean`},size:{control:`select`,options:[`sm`,`md`]},disabled:{control:`boolean`}},args:{label:`Due date`,name:`due`,range:!1,showWeekNumbers:!1,required:!1,hideLabel:!1,size:`md`,disabled:!1},render:e=>i`
    <ds-date-picker
      label=${e.label}
      name=${e.name}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .open=${e.open}
      ?range=${e.range}
      min=${n(e.min)}
      max=${n(e.max)}
      .isDateDisabled=${e.isDateDisabled}
      locale=${n(e.locale)}
      ?show-week-numbers=${e.showWeekNumbers}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      ?required=${e.required}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      ?disabled=${e.disabled}
      error=${n(e.error)}
    ></ds-date-picker>
  `},s={},c={args:{size:`sm`}},l={args:{size:`md`}},u={args:{label:`Date of birth`,name:`dob`,max:`2026-09-16`}},d={args:{label:`Stay`,name:`stay`,range:!0}},f={args:{label:`Appointment`,name:`appointment`,min:`2026-09-16`,showWeekNumbers:!0}},p={args:{label:`Due date`,name:`due`,size:`sm`,hideLabel:!0}},m={args:{label:`Due date`,name:`due`,defaultValue:`2026-09-10`}},h={args:{label:`Stay`,name:`stay`,range:!0,defaultValue:{start:`2026-09-10`,end:`2026-09-14`}}},g={args:{label:`Due date`,name:`due`,defaultValue:`2026-09-10`,error:`Choose a date at least two days from now.`}},_={args:{label:`Fälligkeitsdatum`,name:`due`,locale:`de-DE`,defaultValue:`2026-09-10`}},v={args:{defaultValue:`2026-09-10`}},y={args:{label:`Report period`,name:`period`,range:!0,defaultValue:{start:`2026-09-07`,end:`2026-09-11`}}},b={args:{showWeekNumbers:!0}},x={args:{open:!0,defaultValue:`2026-09-10`}},S={args:{description:`The day the order must ship by.`}},C={args:{required:!0}},w={args:{disabled:!0,defaultValue:`2026-09-10`}},T={args:{error:`Due date is required.`}},E={args:{description:`Weekdays only.`,isDateDisabled:e=>{let[t,n,r]=e.split(`-`).map(Number),i=new Date(Date.UTC(t??0,(n??1)-1,r??1)).getUTCDay();return i===0||i===6}}},D={args:{label:`Fälligkeitsdatum`,locale:`de-DE`,defaultValue:`2026-09-10`}},O={args:{open:!0,defaultValue:`2026-09-10`},render:e=>i`
    <ds-date-picker
      label=${e.label}
      name=${e.name}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      .open=${e.open}
      ?range=${e.range}
      min=${n(e.min)}
      max=${n(e.max)}
      .isDateDisabled=${e.isDateDisabled}
      locale=${n(e.locale)}
      ?show-week-numbers=${e.showWeekNumbers}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      ?required=${e.required}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      ?disabled=${e.disabled}
      error=${n(e.error)}
      @open-change=${e=>{e.currentTarget.open=e.detail.open}}
    ></ds-date-picker>
  `},k=[`Default`,`SizeSm`,`SizeMd`,`DateOfBirth`,`StayDates`,`AppointmentWithWeekNumbers`,`CompactCellEditor`,`WithAValue`,`RangeWithDates`,`WithAnError`,`GermanLocale`,`WithValue`,`RangeWithValue`,`ShowWeekNumbers`,`Open`,`WithDescription`,`Required`,`Disabled`,`WithError`,`WeekendsDisabled`,`LocaleDe`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Date of birth',
    name: 'dob',
    max: '2026-09-16'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Stay',
    name: 'stay',
    range: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Appointment',
    name: 'appointment',
    min: '2026-09-16',
    showWeekNumbers: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Due date',
    name: 'due',
    size: 'sm',
    hideLabel: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Due date',
    name: 'due',
    defaultValue: '2026-09-10'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Stay',
    name: 'stay',
    range: true,
    defaultValue: {
      start: '2026-09-10',
      end: '2026-09-14'
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Due date',
    name: 'due',
    defaultValue: '2026-09-10',
    error: 'Choose a date at least two days from now.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fälligkeitsdatum',
    name: 'due',
    locale: 'de-DE',
    defaultValue: '2026-09-10'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: '2026-09-10'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Report period',
    name: 'period',
    range: true,
    defaultValue: {
      start: '2026-09-07',
      end: '2026-09-11'
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    showWeekNumbers: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: '2026-09-10'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'The day the order must ship by.'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: '2026-09-10'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Due date is required.'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Weekdays only.',
    isDateDisabled: (isoDate: string) => {
      const [year, month, day] = isoDate.split('-').map(Number);
      const weekday = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay();
      return weekday === 0 || weekday === 6;
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fälligkeitsdatum',
    locale: 'de-DE',
    defaultValue: '2026-09-10'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: '2026-09-10'
  },
  render: args => html\`
    <ds-date-picker
      label=\${args.label}
      name=\${args.name}
      .value=\${args.value}
      .defaultValue=\${args.defaultValue}
      .open=\${args.open}
      ?range=\${args.range}
      min=\${ifDefined(args.min)}
      max=\${ifDefined(args.max)}
      .isDateDisabled=\${args.isDateDisabled}
      locale=\${ifDefined(args.locale)}
      ?show-week-numbers=\${args.showWeekNumbers}
      placeholder=\${ifDefined(args.placeholder)}
      description=\${ifDefined(args.description)}
      ?required=\${args.required}
      ?hide-label=\${args.hideLabel}
      size=\${args.size}
      ?disabled=\${args.disabled}
      error=\${ifDefined(args.error)}
      @open-change=\${(event: CustomEvent<DatePickerOpenChangeDetail>) => {
    (event.currentTarget as DsDatePicker).open = event.detail.open;
  }}
    ></ds-date-picker>
  \`
}`,...O.parameters?.docs?.source},description:{story:"The calendar open with its trigger: month/year Selects and prev/next Buttons, the grid (one\r\nroving tab stop), Today and Clear. `open` follows `open-change`, so Escape closes it and\r\nreturns focus to the calendar button.",...O.parameters?.docs?.description}}}})))()}A();export{f as AppointmentWithWeekNumbers,p as CompactCellEditor,u as DateOfBirth,s as Default,w as Disabled,_ as GermanLocale,O as Keyboard,D as LocaleDe,x as Open,h as RangeWithDates,y as RangeWithValue,C as Required,b as ShowWeekNumbers,l as SizeMd,c as SizeSm,d as StayDates,E as WeekendsDisabled,m as WithAValue,g as WithAnError,S as WithDescription,T as WithError,v as WithValue,k as __namedExportsOrder,o as default};