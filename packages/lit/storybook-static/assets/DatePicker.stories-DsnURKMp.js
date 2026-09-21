import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./DatePicker-9EEfL4cd.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),a(),o={title:`DatePicker/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{range:{control:`boolean`},open:{control:`boolean`},showWeekNumbers:{control:`boolean`},required:{control:`boolean`},hideLabel:{control:`boolean`},size:{control:`select`,options:[`sm`,`md`]},disabled:{control:`boolean`}},args:{label:`Due date`,name:`due`,range:!1,showWeekNumbers:!1,required:!1,hideLabel:!1,size:`md`,disabled:!1},render:e=>i`
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
  `},s={},c={args:{size:`sm`}},l={args:{size:`md`}},u={args:{range:!0,label:`Report period`,name:`period`,defaultValue:{start:`2026-09-01`,end:`2026-09-10`}}},d={args:{showWeekNumbers:!0}},f={args:{required:!0}},p={args:{label:`Date of birth`,name:`dob`,description:`Must be at least 18 years ago.`}},m={args:{disabled:!0,defaultValue:`2026-09-10`}},h={args:{open:!0,defaultValue:`2026-09-10`}},g={args:{required:!0,error:`Fix this before continuing.`}},_={args:{label:`Delivery date`,name:`delivery`,isDateDisabled:e=>{let[t,n,r]=e.split(`-`).map(Number),i=new Date(Date.UTC(t,n-1,r)).getUTCDay();return i===0||i===6}}},v={args:{label:`Date of birth`,name:`dob`,max:`2026-09-16`}},y={args:{label:`Stay`,name:`stay`,range:!0}},b={args:{label:`Appointment`,name:`appointment`,min:`2026-09-16`,showWeekNumbers:!0}},x={args:{label:`Due date`,name:`due`,size:`sm`,hideLabel:!0}},S={args:{defaultValue:`2026-09-10`},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-date-picker`);await t?.updateComplete,t?.shadowRoot?.querySelector(`#calendar-button`)?.click()}},C=[`Default`,`SizeSm`,`SizeMd`,`Range`,`ShowWeekNumbers`,`Required`,`WithDescription`,`Disabled`,`Open`,`ErrorIdentified`,`WeekendsDisabled`,`DateOfBirth`,`StayDates`,`AppointmentWithWeekNumbers`,`CompactCellEditor`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    range: true,
    label: 'Report period',
    name: 'period',
    defaultValue: {
      start: '2026-09-01',
      end: '2026-09-10'
    }
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    showWeekNumbers: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Date of birth',
    name: 'dob',
    description: 'Must be at least 18 years ago.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: '2026-09-10'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    defaultValue: '2026-09-10'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Fix this before continuing.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Delivery date',
    name: 'delivery',
    isDateDisabled: (isoDate: string) => {
      const [y, m, d] = isoDate.split('-').map(Number);
      const weekday = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
      return weekday === 0 || weekday === 6;
    }
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Date of birth',
    name: 'dob',
    max: '2026-09-16'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Stay',
    name: 'stay',
    range: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Appointment',
    name: 'appointment',
    min: '2026-09-16',
    showWeekNumbers: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Due date',
    name: 'due',
    size: 'sm',
    hideLabel: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: '2026-09-10'
  },
  play: async ({
    canvasElement
  }) => {
    const picker = canvasElement.querySelector('ds-date-picker');
    await picker?.updateComplete;
    picker?.shadowRoot?.querySelector<HTMLElement>('#calendar-button')?.click();
  }
}`,...S.parameters?.docs?.source},description:{story:`Open (uncontrolled, so Escape closes it) with its trigger and the calendar's\r
focusable controls: prev/next, month/year Selects, the grid's roving day,\r
Today and Clear.`,...S.parameters?.docs?.description}}}})))()}w();export{b as AppointmentWithWeekNumbers,x as CompactCellEditor,v as DateOfBirth,s as Default,m as Disabled,g as ErrorIdentified,S as Keyboard,h as Open,u as Range,f as Required,d as ShowWeekNumbers,l as SizeMd,c as SizeSm,y as StayDates,_ as WeekendsDisabled,p as WithDescription,C as __namedExportsOrder,o as default};