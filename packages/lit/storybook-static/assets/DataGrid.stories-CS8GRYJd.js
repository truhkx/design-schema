import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{s as a}from"./iframe-CV6aZYyO.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{t(),r(),a(),o={title:`DataGrid/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`sort-change`,`selection-change`,`cell-change`,`edit-start`,`range-needed`,`column-resize`]}},argTypes:{captionLevel:{control:`select`,options:[`2`,`3`,`4`]},selectable:{control:`select`,options:[`none`,`row`,`cell`,`range`]},density:{control:`select`,options:[`compact`,`comfortable`]},height:{control:`select`,options:[`content`,`viewport`,`fixed`]}},args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:120,pinned:`start`},{key:`name`,header:`Name`,width:200,resizable:!0,editable:!0,editor:`text`},{key:`price`,header:`Price (USD)`,align:`end`,sortable:!0,editable:!0,editor:`number`,width:120,validate:e=>typeof e==`number`&&e>=0?void 0:`Enter a price of 0 or more.`},{key:`qty`,header:`Qty`,abbr:`Quantity`,align:`end`,sortable:!0,width:80},{key:`category`,header:`Category`,width:160,editable:!0,editor:`select`,options:[{value:`hardware`,label:`Hardware`},{value:`software`,label:`Software`}]},{key:`inStock`,header:`In stock`,width:96,editable:!0,editor:`checkbox`}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10,qty:240,category:`hardware`,inStock:!0},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20,qty:85,category:`hardware`,inStock:!0},{id:`c`,sku:`C-3`,name:`License`,price:199,qty:12,category:`software`,inStock:!1},{id:`d`,sku:`D-4`,name:`Gear`,price:45,qty:4,category:`hardware`,inStock:!0},{id:`e`,sku:`E-5`,name:`Plan`,price:15,qty:500,category:`software`,inStock:!0}]},render:e=>i`
    <ds-data-grid
      caption=${e.caption}
      caption-level=${e.captionLevel??`2`}
      ?hide-caption=${e.hideCaption??!1}
      .columns=${e.columns}
      .data=${e.data}
      .rowCount=${e.rowCount}
      .sort=${e.sort}
      .defaultSort=${e.defaultSort}
      selectable=${e.selectable??`none`}
      .selected=${e.selected}
      ?editable=${e.editable??!1}
      density=${e.density??`compact`}
      ?no-sticky-header=${e.stickyHeader===!1}
      height=${e.height??`viewport`}
      ?loading=${e.loading??!1}
      empty-message=${n(e.emptyMessage)}
      ?no-status-bar=${e.showStatusBar===!1}
    ></ds-data-grid>
  `},s={},c={args:{captionLevel:`2`}},l={args:{captionLevel:`3`}},u={args:{captionLevel:`4`}},d={args:{selectable:`none`}},f={args:{selectable:`row`}},p={args:{selectable:`cell`}},m={args:{selectable:`range`}},h={args:{density:`compact`}},g={args:{density:`comfortable`}},_={args:{height:`content`}},v={args:{height:`viewport`}},y={args:{height:`fixed`}},b={args:{hideCaption:!0}},x={args:{loading:!0}},S={args:{data:[]}},C={args:{showStatusBar:!1}},w={args:{defaultSort:{column:`price`,direction:`descending`}}},T={args:{rowCount:200,height:`fixed`}},E={args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`},{key:`price`,header:`Price`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20}]}},D={args:{caption:`Stock levels`,editable:!0,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0},{key:`onHand`,header:`On hand`,align:`end`,editable:!0,editor:`number`}],data:[{id:`a`,sku:`A-1`,onHand:12},{id:`b`,sku:`B-2`,onHand:4}]}},O={args:{caption:`Orders`,selectable:`row`,density:`comfortable`,columns:[{key:`order`,header:`Order`,isRowHeader:!0},{key:`customer`,header:`Customer`}],data:[{id:`a`,order:`1001`,customer:`Ana Souza`},{id:`b`,order:`1002`,customer:`Bo Lin`}]}},k={args:{caption:`Daily figures`,selectable:`range`,height:`fixed`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},A={args:{selectable:`range`,editable:!0,height:`content`}},j=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`SelectableRange`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`HideCaption`,`Loading`,`Empty`,`NoStatusBar`,`DefaultSort`,`ServerPaged`,`PriceList`,`EditableCells`,`RowSelectionForBulkActions`,`RangeSelection`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'content'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'price',
      direction: 'descending'
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    rowCount: 200,
    height: 'fixed'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Price list',
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true,
      width: 160
    }, {
      key: 'name',
      header: 'Name'
    }, {
      key: 'price',
      header: 'Price',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      name: 'Widget',
      price: 10
    }, {
      id: 'b',
      sku: 'B-2',
      name: 'Sprocket',
      price: 20
    }]
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Stock levels',
    editable: true,
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true
    }, {
      key: 'onHand',
      header: 'On hand',
      align: 'end',
      editable: true,
      editor: 'number'
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      onHand: 12
    }, {
      id: 'b',
      sku: 'B-2',
      onHand: 4
    }]
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Orders',
    selectable: 'row',
    density: 'comfortable',
    columns: [{
      key: 'order',
      header: 'Order',
      isRowHeader: true
    }, {
      key: 'customer',
      header: 'Customer'
    }],
    data: [{
      id: 'a',
      order: '1001',
      customer: 'Ana Souza'
    }, {
      id: 'b',
      order: '1002',
      customer: 'Bo Lin'
    }]
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily figures',
    selectable: 'range',
    height: 'fixed',
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range',
    editable: true,
    height: 'content'
  }
}`,...A.parameters?.docs?.source},description:{story:`The grid present with sortable headers, a resizable column and editable cells to navigate between.`,...A.parameters?.docs?.description}}}})))()}M();export{c as CaptionLevel2,l as CaptionLevel3,u as CaptionLevel4,s as Default,w as DefaultSort,g as DensityComfortable,h as DensityCompact,D as EditableCells,S as Empty,_ as HeightContent,y as HeightFixed,v as HeightViewport,b as HideCaption,A as Keyboard,x as Loading,C as NoStatusBar,E as PriceList,k as RangeSelection,O as RowSelectionForBulkActions,p as SelectableCell,d as SelectableNone,m as SelectableRange,f as SelectableRow,T as ServerPaged,j as __namedExportsOrder,o as default};