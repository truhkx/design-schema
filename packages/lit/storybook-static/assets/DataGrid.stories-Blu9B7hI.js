import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{s as r}from"./iframe-CsoUKhN4.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),r(),i=[{key:`name`,header:`Item`,isRowHeader:!0,resizable:!0,width:180},{key:`sku`,header:`SKU`,width:120},{key:`price`,header:`Price (USD)`,align:`end`,sortable:!0,editable:!0,editor:`number`,width:120,validate:e=>typeof e==`number`&&e>=0?void 0:`Enter a positive amount.`},{key:`quantity`,header:`Qty`,abbr:`Quantity`,align:`end`,sortable:!0,editable:!0,editor:`number`,width:100},{key:`category`,header:`Category`,editable:!0,editor:`select`,width:160,options:[{value:`hardware`,label:`Hardware`},{value:`software`,label:`Software`},{value:`services`,label:`Services`}]},{key:`inStock`,header:`In stock`,editable:!0,editor:`checkbox`,width:100}],a=[{id:`sku-1001`,name:`USB-C cable`,sku:`CBL-1001`,price:12.5,quantity:240,category:`hardware`,inStock:!0},{id:`sku-1002`,name:`Wireless mouse`,sku:`MSE-1002`,price:24,quantity:85,category:`hardware`,inStock:!0},{id:`sku-1003`,name:`Design Schema license`,sku:`LIC-1003`,price:199,quantity:12,category:`software`,inStock:!1},{id:`sku-1004`,name:`Onboarding session`,sku:`SVC-1004`,price:450,quantity:4,category:`services`,inStock:!0},{id:`sku-1005`,name:`Mechanical keyboard`,sku:`KEY-1005`,price:89,quantity:32,category:`hardware`,inStock:!0},{id:`sku-1006`,name:`Cloud storage plan`,sku:`LIC-1006`,price:15,quantity:500,category:`software`,inStock:!0}],o={title:`DataGrid/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`sort-change`,`selection-change`,`cell-change`,`edit-start`,`range-needed`,`column-resize`]}},argTypes:{selectable:{control:`select`,options:[`none`,`row`,`cell`,`range`]},density:{control:`select`,options:[`compact`,`comfortable`]},height:{control:`select`,options:[`content`,`viewport`,`fixed`]},hideCaption:{control:`boolean`},editable:{control:`boolean`},stickyHeader:{control:`boolean`},loading:{control:`boolean`},showStatusBar:{control:`boolean`}},args:{caption:`Price list`,hideCaption:!1,columns:i,data:a,selectable:`none`,editable:!1,density:`compact`,stickyHeader:!0,height:`viewport`,loading:!1,showStatusBar:!0},render:e=>n`
    <ds-data-grid
      caption=${e.caption}
      ?hide-caption=${e.hideCaption}
      .columns=${e.columns}
      .data=${e.data}
      selectable=${e.selectable}
      ?editable=${e.editable}
      density=${e.density}
      ?no-sticky-header=${!e.stickyHeader}
      height=${e.height}
      ?loading=${e.loading}
      empty-message=${e.emptyMessage??``}
      ?no-status-bar=${!e.showStatusBar}
      @sort-change=${e=>console.log(`sort-change`,e.detail)}
      @selection-change=${e=>console.log(`selection-change`,e.detail)}
      @cell-change=${e=>console.log(`cell-change`,e.detail)}
      @edit-start=${e=>console.log(`edit-start`,e.detail)}
      @range-needed=${e=>console.log(`range-needed`,e.detail)}
      @column-resize=${e=>console.log(`column-resize`,e.detail)}
    ></ds-data-grid>
  `},s={},c={args:{selectable:`none`}},l={args:{selectable:`row`}},u={args:{selectable:`cell`}},d={args:{selectable:`range`}},f={args:{density:`compact`}},p={args:{density:`comfortable`}},m={args:{height:`content`}},h={args:{height:`viewport`}},g={args:{height:`fixed`}},_={args:{hideCaption:!0}},v={args:{editable:!0,selectable:`range`}},y={args:{loading:!0}},b={args:{data:[]}},x={args:{data:[],emptyMessage:`No items match these filters.`}},S={args:{showStatusBar:!1}},C={args:{data:a.slice(0,3),rowCount:200,height:`fixed`},render:e=>n`
    <ds-data-grid
      caption=${e.caption}
      .columns=${e.columns}
      .data=${e.data}
      row-count=${e.rowCount??``}
      height="fixed"
      @range-needed=${e=>console.log(`range-needed`,e.detail)}
    ></ds-data-grid>
  `},w={args:{selectable:`range`,editable:!0}},T=[`Default`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`SelectableRange`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`HideCaption`,`Editable`,`Loading`,`Empty`,`EmptyMessage`,`NoStatusBar`,`ServerPaged`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    editable: true,
    selectable: 'range'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    data: [],
    emptyMessage: 'No items match these filters.'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    data: priceListRows.slice(0, 3),
    rowCount: 200,
    height: 'fixed'
  },
  render: args => html\`
    <ds-data-grid
      caption=\${args.caption}
      .columns=\${args.columns}
      .data=\${args.data}
      row-count=\${args.rowCount ?? ''}
      height="fixed"
      @range-needed=\${(event: CustomEvent<DataGridRangeNeededDetail>) => console.log('range-needed', event.detail)}
    ></ds-data-grid>
  \`
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range',
    editable: true
  }
}`,...w.parameters?.docs?.source},description:{story:`A grid with a sortable, editable price list and range selection — enough focusable structure (header sort\r
button, resizable column, several editable cells) to exercise arrow navigation, Enter/F2 editing and Escape.`,...w.parameters?.docs?.description}}}})))()}E();export{s as Default,p as DensityComfortable,f as DensityCompact,v as Editable,b as Empty,x as EmptyMessage,m as HeightContent,g as HeightFixed,h as HeightViewport,_ as HideCaption,w as Keyboard,y as Loading,S as NoStatusBar,u as SelectableCell,c as SelectableNone,d as SelectableRange,l as SelectableRow,C as ServerPaged,T as __namedExportsOrder,o as default};