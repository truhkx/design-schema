import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Icon-CGupucWg.js";import{t as i}from"./Button-TSn-G4Vm.js";import{c as a}from"./iframe-CsoUKhN4.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{t(),a(),i(),r(),o=[{key:`id`,header:`Invoice`,isRowHeader:!0},{key:`customer`,header:`Customer`},{key:`amount`,header:`Amount (USD)`,align:`end`,sortable:!0},{key:`status`,header:`Status`,hideBelow:`content`}],s=[{id:`INV-1001`,customer:`Acme Co.`,amount:`$1,240.00`,status:`Open`},{id:`INV-1002`,customer:`Globex`,amount:`$860.50`,status:`Open`},{id:`INV-1003`,customer:`Initech`,amount:`$3,020.00`,status:`Overdue`},{id:`INV-1004`,customer:`Umbrella Corp.`,amount:`$412.75`,status:`Paid`}],c=[{key:`month`,header:`Month`,isRowHeader:!0},{key:`q1`,header:`Region A`,align:`end`},{key:`q2`,header:`Region B`,align:`end`},{key:`q3`,header:`Region C`,align:`end`},{key:`q4`,header:`Region D`,align:`end`},{key:`q5`,header:`Region E`,align:`end`}],l=[{id:`jan`,month:`January`,q1:`1,204`,q2:`980`,q3:`760`,q4:`1,102`,q5:`640`},{id:`feb`,month:`February`,q1:`1,410`,q2:`1,020`,q3:`812`,q4:`990`,q5:`705`},{id:`mar`,month:`March`,q1:`1,330`,q2:`1,105`,q3:`890`,q4:`1,240`,q5:`812`}],u={title:`Table/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`sort-change`,`selection-change`,`row-press`]}},argTypes:{captionLevel:{control:`select`,options:[`2`,`3`,`4`]},selectable:{control:`select`,options:[`none`,`single`,`multiple`]},responsive:{control:`select`,options:[`stack`,`scroll`]},maxHeight:{control:`select`,options:[`none`,`viewport`]},density:{control:`select`,options:[`compact`,`comfortable`]},hideCaption:{control:`boolean`},stickyHeader:{control:`boolean`},striped:{control:`boolean`},loading:{control:`boolean`}},args:{caption:`Open invoices`,captionLevel:`2`,hideCaption:!1,columns:o,data:s,selectable:`none`,responsive:`stack`,stickyHeader:!0,maxHeight:`none`,density:`comfortable`,striped:!1,loading:!1},render:e=>n`
    <ds-table
      caption=${e.caption}
      caption-level=${e.captionLevel}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      selectable=${e.selectable}
      responsive=${e.responsive}
      ?no-sticky-header=${!e.stickyHeader}
      max-height=${e.maxHeight}
      density=${e.density}
      ?striped=${e.striped}
      ?loading=${e.loading}
      empty-message=${e.emptyMessage??``}
      @sort-change=${e=>console.log(`sort-change`,e.detail)}
      @selection-change=${e=>console.log(`selection-change`,e.detail)}
      @row-press=${e=>console.log(`row-press`,e.detail)}
    ></ds-table>
  `},d={},f={args:{captionLevel:`2`}},p={args:{captionLevel:`3`}},m={args:{captionLevel:`4`}},h={args:{selectable:`none`}},g={args:{selectable:`single`}},_={args:{selectable:`multiple`}},v={args:{responsive:`stack`}},y={args:{responsive:`scroll`,columns:c,data:l,caption:`Revenue by region`}},b={args:{maxHeight:`none`}},x={args:{maxHeight:`viewport`,data:[...s,...s.map(e=>({...e,id:`${e.id}-B`}))]}},S={args:{density:`compact`}},C={args:{density:`comfortable`}},w={args:{hideCaption:!0}},T={args:{stickyHeader:!1}},E={args:{striped:!0}},D={args:{loading:!0}},O={args:{loading:!0,data:[]}},k={args:{data:[]}},A={args:{data:[],emptyMessage:`No invoices match these filters.`}},j={render:e=>n`
    <ds-table
      caption=${e.caption}
      .columns=${e.columns}
      .data=${e.data}
      .rowActions=${e=>n`
        <ds-button variant="ghost" size="sm" icon-only label="Edit ${e.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      `}
    ></ds-table>
  `},M={render:()=>n`
    <ds-table
      caption="Open invoices"
      selectable="multiple"
      .columns=${o}
      .data=${s}
      .rowActions=${e=>n`
        <ds-button variant="ghost" size="sm" icon-only label="Edit ${e.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      `}
    ></ds-table>
  `},N=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`ResponsiveStack`,`ResponsiveScroll`,`MaxHeightNone`,`MaxHeightViewport`,`DensityCompact`,`DensityComfortable`,`HideCaption`,`NoStickyHeader`,`Striped`,`Loading`,`LoadingEmpty`,`Empty`,`EmptyMessage`,`RowActions`,`Keyboard`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll',
    columns: wideColumns,
    data: wideRows,
    caption: 'Revenue by region'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport',
    data: [...invoiceRows, ...invoiceRows.map(row => ({
      ...row,
      id: \`\${row.id}-B\`
    }))]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    stickyHeader: false
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    data: []
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No invoices match these filters.'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-table
      caption=\${args.caption}
      .columns=\${args.columns}
      .data=\${args.data}
      .rowActions=\${(row: TableRow) => html\`
        <ds-button variant="ghost" size="sm" icon-only label="Edit \${row.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      \`}
    ></ds-table>
  \`
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-table
      caption="Open invoices"
      selectable="multiple"
      .columns=\${invoiceColumns}
      .data=\${invoiceRows}
      .rowActions=\${(row: TableRow) => html\`
        <ds-button variant="ghost" size="sm" icon-only label="Edit \${row.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      \`}
    ></ds-table>
  \`
}`,...M.parameters?.docs?.source},description:{story:'`selectable="multiple"` with a sortable column and row actions gives select-all, a sort button, per-row\r\ncheckboxes and per-row action buttons — every kind of focusable content Tab moves through in reading order.',...M.parameters?.docs?.description}}}})))()}P();export{f as CaptionLevel2,p as CaptionLevel3,m as CaptionLevel4,d as Default,C as DensityComfortable,S as DensityCompact,k as Empty,A as EmptyMessage,w as HideCaption,M as Keyboard,D as Loading,O as LoadingEmpty,b as MaxHeightNone,x as MaxHeightViewport,T as NoStickyHeader,y as ResponsiveScroll,v as ResponsiveStack,j as RowActions,_ as SelectableMultiple,h as SelectableNone,g as SelectableSingle,E as Striped,N as __namedExportsOrder,u as default};