import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{T as t,_ as n,b as r,w as i}from"./if-defined-CARySXJh.js";import{o as a,r as o}from"./directive-helpers-DkZg2Mgc.js";import{i as s,n as c,r as l,t as u}from"./directive-CZiujxgm.js";import{t as d}from"./Menu-DSG28tJZ.js";function f(e){this._$AN===void 0?this._$AM=e:(h(this),this._$AM=e,g(this))}function p(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)m(r[e],!1),h(r[e]);else r!=null&&(m(r,!1),h(r))}else m(this,e)}}var m,h,g,_,v;function y(){return(y=e((()=>{o(),l(),m=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),m(e,t);return!0},h=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},g=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),_(t)}},_=e=>{e.type==s.CHILD&&(e._$AP??=p,e._$AQ??=f)},v=class extends c{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),g(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(m(this,e),h(this))}setValue(e){if(a(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}})))()}var b,x;function S(){return(S=e((()=>{t(),y(),l(),b=new WeakMap,x=u(class extends v{render(e){return r}update(e,[t]){let n=t!==this.G;return n&&this.rt(void 0),(n||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),r}rt(e){if(this.G!==void 0){if(this.isConnected||(e=void 0),typeof this.G==`function`){let t=this.ht??globalThis,n=b.get(t);n===void 0&&(n=new WeakMap,b.set(t,n)),n.get(this.G)!==void 0&&this.G.call(this.ht,void 0),n.set(this.G,e),e!==void 0&&this.G.call(this.ht,e)}else this.G.value=e}}get lt(){return typeof this.G==`function`?b.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}})})))()}function C(){return(C=e((()=>{S()})))()}function w(e){let t=e.currentTarget;t.open!==void 0&&(t.open=e.detail.open)}function T(e){let t=e;t?.parentElement&&(t.anchor=t.parentElement)}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{n(),C(),d(),E=[{id:`open`,label:`Open`,icon:`external`},{id:`rename`,label:`Rename`,shortcut:`Ctrl+R`},{id:`duplicate`,label:`Duplicate`},{group:`Sort by`,items:[{id:`sort-name`,label:`Name`},{id:`sort-date`,label:`Date modified`}]},{separator:!0},{id:`archive`,label:`Archive`,disabled:!0},{id:`delete`,label:`Delete`,tone:`danger`}],D=`display: inline-block; padding: 2rem; border: 1px dashed currentColor`,O={title:`Menu/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`action`,`open-change`]}},argTypes:{triggerVariant:{control:`select`,options:[`ghost`,`secondary`,`primary`]},triggerIcon:{control:`select`,options:[`ellipsis`,`chevron-down`,`none`]},placement:{control:`select`,options:[`bottom-start`,`bottom-end`,`top-start`,`top-end`]}},args:{label:`More actions`,items:E,triggerVariant:`ghost`,triggerIcon:`chevron-down`,iconOnly:!1,placement:`bottom-start`},render:e=>i`
    <ds-menu
      label=${e.label}
      .items=${e.items}
      trigger-variant=${e.triggerVariant}
      trigger-icon=${e.triggerIcon}
      ?icon-only=${e.iconOnly}
      placement=${e.placement}
      .open=${e.open}
      @open-change=${w}
    ></ds-menu>
  `},k={},A={args:{triggerVariant:`ghost`}},j={args:{triggerVariant:`secondary`}},M={args:{triggerVariant:`primary`}},N={args:{triggerIcon:`ellipsis`}},P={args:{triggerIcon:`chevron-down`}},F={args:{triggerIcon:`none`}},I={args:{placement:`bottom-start`}},L={args:{placement:`bottom-end`}},R={args:{placement:`top-start`}},z={args:{placement:`top-end`}},B={args:{iconOnly:!0,triggerIcon:`ellipsis`}},V={args:{open:!0}},H={args:{label:`More actions`,iconOnly:!0,triggerIcon:`ellipsis`,items:[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{separator:!0},{id:`delete`,label:`Delete file`,tone:`danger`}]}},U={args:{label:`Sort by`,triggerVariant:`secondary`,triggerIcon:`chevron-down`,items:[{id:`name`,label:`Name`},{id:`modified`,label:`Last modified`},{id:`size`,label:`Size`}]}},W={args:{label:`Account`,placement:`bottom-end`,items:[{group:`Account`,items:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`}]},{group:`Workspace`,items:[{id:`members`,label:`Members`},{id:`settings`,label:`Settings`}]},{separator:!0},{id:`sign-out`,label:`Sign out`}]}},G={args:{label:`Edit`,items:[{id:`undo`,label:`Undo`,shortcut:`Ctrl+Z`},{id:`redo`,label:`Redo`,shortcut:`Ctrl+Shift+Z`}]}},K={args:{open:!0},render:e=>i`
    <div style=${D}>
      Anchor element
      <ds-menu
        ${x(T)}
        label=${e.label}
        .items=${e.items}
        placement=${e.placement}
        .open=${e.open}
        @open-change=${w}
      ></ds-menu>
    </div>
  `},q=[`Default`,`TriggerVariantGhost`,`TriggerVariantSecondary`,`TriggerVariantPrimary`,`TriggerIconEllipsis`,`TriggerIconChevronDown`,`TriggerIconNone`,`PlacementBottomStart`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTopEnd`,`IconOnly`,`Keyboard`,`RowOverflow`,`SortBy`,`GroupedAccountMenu`,`WithShortcuts`,`AnchorPositioned`],k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'ghost'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'secondary'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'primary'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'ellipsis'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'chevron-down'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'none'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    iconOnly: true,
    triggerIcon: 'ellipsis'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...V.parameters?.docs?.source},description:{story:`Open with its trigger and more than three enabled items, for the keyboard gate.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'More actions',
    iconOnly: true,
    triggerIcon: 'ellipsis',
    items: [{
      id: 'rename',
      label: 'Rename'
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }, {
      separator: true
    }, {
      id: 'delete',
      label: 'Delete file',
      tone: 'danger'
    }]
  }
}`,...H.parameters?.docs?.source},description:{story:`The icon-only overflow button on a row, with the destructive action last after a separator.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sort by',
    triggerVariant: 'secondary',
    triggerIcon: 'chevron-down',
    items: [{
      id: 'name',
      label: 'Name'
    }, {
      id: 'modified',
      label: 'Last modified'
    }, {
      id: 'size',
      label: 'Size'
    }]
  }
}`,...U.parameters?.docs?.source},description:{story:`A labelled dropdown of view options, anchored under a secondary trigger.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Account',
    placement: 'bottom-end',
    items: [{
      group: 'Account',
      items: [{
        id: 'profile',
        label: 'Profile'
      }, {
        id: 'billing',
        label: 'Billing'
      }]
    }, {
      group: 'Workspace',
      items: [{
        id: 'members',
        label: 'Members'
      }, {
        id: 'settings',
        label: 'Settings'
      }]
    }, {
      separator: true
    }, {
      id: 'sign-out',
      label: 'Sign out'
    }]
  }
}`,...W.parameters?.docs?.source},description:{story:`More than about six items, so they are grouped with labels; aligned to the end of the trigger.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Edit',
    items: [{
      id: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z'
    }, {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z'
    }]
  }
}`,...G.parameters?.docs?.source},description:{story:`Display-only shortcut hints beside the items the app binds elsewhere.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  render: args => html\`
    <div style=\${ANCHOR_STYLE}>
      Anchor element
      <ds-menu
        \${ref(anchorToParent)}
        label=\${args.label}
        .items=\${args.items}
        placement=\${args.placement}
        .open=\${args.open}
        @open-change=\${followOpenChange}
      ></ds-menu>
    </div>
  \`
}`,...K.parameters?.docs?.source},description:{story:"`anchor` positions the popup on an arbitrary element instead of rendering a trigger — a context menu.",...K.parameters?.docs?.description}}}})))()}J();export{K as AnchorPositioned,k as Default,W as GroupedAccountMenu,B as IconOnly,V as Keyboard,L as PlacementBottomEnd,I as PlacementBottomStart,z as PlacementTopEnd,R as PlacementTopStart,H as RowOverflow,U as SortBy,P as TriggerIconChevronDown,N as TriggerIconEllipsis,F as TriggerIconNone,A as TriggerVariantGhost,M as TriggerVariantPrimary,j as TriggerVariantSecondary,G as WithShortcuts,q as __namedExportsOrder,O as default};