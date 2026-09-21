import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Icon-BHsrajXm.js";import{t as i}from"./Text-BrJPDVza.js";import{t as a}from"./Button-DJvb7DFH.js";import{c as o}from"./iframe-CV6aZYyO.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{t(),o(),a(),r(),i(),s=[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`customer`,header:`Customer`},{key:`due`,header:`Due`,hideBelow:`content`},{key:`amount`,header:`Amount (USD)`,align:`end`,sortable:!0}],c=[{id:`a`,invoice:`INV-1001`,customer:`Acme Co.`,due:`12 Sep`,amount:1240},{id:`b`,invoice:`INV-1002`,customer:`Globex`,due:`19 Sep`,amount:860.5},{id:`c`,invoice:`INV-1003`,customer:`Initech`,due:`26 Sep`,amount:3020},{id:`d`,invoice:`INV-1004`,customer:`Umbrella Corp.`,due:`3 Oct`,amount:412.75}],l=e=>n`
  <ds-button variant="ghost" size="sm" icon-only label="Edit ${String(e.invoice??e.id)}">
    <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
  </ds-button>
`,u={title:`Table/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`sort-change`,`selection-change`,`row-press`]}},argTypes:{captionLevel:{control:`select`,options:[`2`,`3`,`4`]},selectable:{control:`select`,options:[`none`,`single`,`multiple`]},responsive:{control:`select`,options:[`stack`,`scroll`]},maxHeight:{control:`select`,options:[`none`,`viewport`]},density:{control:`select`,options:[`compact`,`comfortable`]},hideCaption:{control:`boolean`},stickyHeader:{control:`boolean`},striped:{control:`boolean`},loading:{control:`boolean`},emptyMessage:{control:`text`}},args:{caption:`Open invoices`,captionLevel:`2`,hideCaption:!1,columns:s,data:c,selectable:`none`,responsive:`stack`,stickyHeader:!0,maxHeight:`none`,density:`comfortable`,striped:!1,loading:!1},render:e=>n`
    <ds-table
      caption=${e.caption}
      caption-level=${e.captionLevel}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      .sort=${e.sort}
      .defaultSort=${e.defaultSort}
      selectable=${e.selectable}
      .selected=${e.selected}
      .defaultSelected=${e.defaultSelected}
      responsive=${e.responsive}
      ?no-sticky-header=${!e.stickyHeader}
      max-height=${e.maxHeight}
      density=${e.density}
      ?striped=${e.striped}
      .emptyMessage=${e.emptyMessage}
      ?loading=${e.loading}
      .rowActions=${e.rowActions}
    ></ds-table>
  `},d={},f={args:{captionLevel:`2`}},p={args:{captionLevel:`3`}},m={args:{captionLevel:`4`}},h={args:{selectable:`none`}},g={args:{selectable:`single`}},_={args:{selectable:`multiple`}},v={args:{responsive:`stack`}},y={args:{responsive:`scroll`}},b={args:{maxHeight:`none`}},x={args:{maxHeight:`viewport`}},S={args:{density:`compact`}},C={args:{density:`comfortable`}},w={args:{hideCaption:!0}},T={args:{stickyHeader:!1}},E={args:{striped:!0}},D={args:{loading:!0}},O={args:{data:[]}},k={args:{rowActions:l}},A={render:e=>n`
    <ds-table caption=${e.caption} .columns=${e.columns} .data=${e.data} pressable-rows></ds-table>
  `},j={render:e=>n`
    <ds-table caption=${e.caption} .columns=${e.columns} .data=${e.data}>
      <ds-text slot="footer" tone="muted" size="sm">4 rows</ds-text>
    </ds-table>
  `},M={args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},N={args:{caption:`Members`,selectable:`multiple`,defaultSelected:[`a`],columns:[{key:`person`,header:`Person`,isRowHeader:!0},{key:`role`,header:`Role`}],data:[{id:`a`,person:`Ana Souza`,role:`Admin`},{id:`b`,person:`Bo Lin`,role:`Editor`}]}},P={args:{caption:`Daily traffic`,responsive:`scroll`,density:`compact`,maxHeight:`viewport`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},F={args:{caption:`Open invoices`,emptyMessage:`No invoices yet.`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0}],data:[]}},I={args:{selectable:`multiple`,rowActions:l}},L=`Default.CaptionLevel2.CaptionLevel3.CaptionLevel4.SelectableNone.SelectableSingle.SelectableMultiple.ResponsiveStack.ResponsiveScroll.MaxHeightNone.MaxHeightViewport.DensityCompact.DensityComfortable.HideCaption.NoStickyHeader.Striped.Loading.Empty.RowActions.RowPress.WithFooter.OpenInvoices.SelectableRows.DenseDataTableThatScrolls.NothingToShow.Keyboard`.split(`.`),d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
    responsive: 'scroll'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport'
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
    data: []
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: editAction
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:"{\n  render: args => html`\n    <ds-table caption=${args.caption} .columns=${args.columns} .data=${args.data} pressable-rows></ds-table>\n  `\n}",...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-table caption=\${args.caption} .columns=\${args.columns} .data=\${args.data}>
      <ds-text slot="footer" tone="muted" size="sm">4 rows</ds-text>
    </ds-table>
  \`
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }, {
      key: 'due',
      header: 'Due'
    }, {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      invoice: 'INV-1',
      due: '12 Sep',
      amount: 100
    }, {
      id: 'b',
      invoice: 'INV-2',
      due: '19 Sep',
      amount: 200
    }]
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Members',
    selectable: 'multiple',
    defaultSelected: ['a'],
    columns: [{
      key: 'person',
      header: 'Person',
      isRowHeader: true
    }, {
      key: 'role',
      header: 'Role'
    }],
    data: [{
      id: 'a',
      person: 'Ana Souza',
      role: 'Admin'
    }, {
      id: 'b',
      person: 'Bo Lin',
      role: 'Editor'
    }]
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily traffic',
    responsive: 'scroll',
    density: 'compact',
    maxHeight: 'viewport',
    columns: [{
      key: 'day',
      header: 'Day',
      isRowHeader: true
    }, {
      key: 'visits',
      header: 'Visits',
      align: 'end'
    }, {
      key: 'signups',
      header: 'Signups',
      align: 'end'
    }],
    data: [{
      id: 'a',
      day: 'Monday',
      visits: 1200,
      signups: 30
    }, {
      id: 'b',
      day: 'Tuesday',
      visits: 1450,
      signups: 41
    }]
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    emptyMessage: 'No invoices yet.',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }],
    data: []
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    rowActions: editAction
  }
}`,...I.parameters?.docs?.source},description:{story:`Select-all, a sort button, row checkboxes and row actions: Tab moves through them in reading order.`,...I.parameters?.docs?.description}}}})))()}R();export{f as CaptionLevel2,p as CaptionLevel3,m as CaptionLevel4,d as Default,P as DenseDataTableThatScrolls,C as DensityComfortable,S as DensityCompact,O as Empty,w as HideCaption,I as Keyboard,D as Loading,b as MaxHeightNone,x as MaxHeightViewport,T as NoStickyHeader,F as NothingToShow,M as OpenInvoices,y as ResponsiveScroll,v as ResponsiveStack,k as RowActions,A as RowPress,_ as SelectableMultiple,h as SelectableNone,N as SelectableRows,g as SelectableSingle,E as Striped,j as WithFooter,L as __namedExportsOrder,u as default};