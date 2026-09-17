import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as ee,c as te,h as ne,l as i,m as a,n as re,o,r as s,t as c}from"./decorators-Dl4455ZU.js";import{n as l,t as ie}from"./Platform-qE9g7V_t.js";import{n as ae,t as oe}from"./Animated-75prr5wJ.js";import{n as u,t as se}from"./Pressable-CjGHHyHY.js";import{n as ce,t as le}from"./BottomSheet-CVGOiIhz.js";import{n as ue,t as de}from"./Modal-DsdNBXp0.js";import{n as fe,t as pe}from"./TextInput-DRcWOdRi.js";import{n as d,t as me}from"./Icon-sSovLWRe.js";import{n as he,t as ge}from"./useWindowDimensions-oJibnkug.js";import{t as _e}from"./react-native-web-CvoPEK_w.js";import{c as ve,i as ye,l as be,m as f,o as xe,p as Se,r as Ce,s as we}from"./iframe-CAToN8Eb.js";import{n as Te,r as Ee}from"./FormContext-3EoEHyqs.js";import{n as De,t as Oe}from"./Button-B0Tk0pjd.js";import{n as ke,t as Ae}from"./Listbox-CHyWJ3Ix.js";function je(e){return(new Intl.PluralRules(void 0).select(e)===`one`?_.resultCount.one:_.resultCount.other).replace(`{count}`,String(e))}function Me(e){return`group`in e}function Ne(e){let t=[];return e.forEach(e=>{Me(e)?t.push(...e.options):t.push(e)}),t}function p(e){return e.normalize(`NFD`).replace(/[̀-ͯ]/g,``).toLowerCase()}function m({label:e,name:t,options:n,value:r,defaultValue:te,open:ne,inputValue:re,multiple:o=!1,allowCustom:c=!1,filter:l=`contains`,placeholder:ae,description:u,required:ce=!1,disabled:ue=!1,invalid:fe=!1,error:d,loading:ge=!1,clearable:be=!0,overrides:f,ref:Ce,onChange:Te,onInputChange:De,onOpenChange:ke}){let{tokens:m}=ve(),v=Ee(),y=we(),{width:Fe,height:b}=he(),x=h.useRef(null),S=h.useRef(null),C=o?[]:``,[w,T]=h.useState(te??C),[E,D]=h.useState(()=>{let e=r??te;return o||typeof e!=`string`||e===``?``:Ne(n).find(t=>t.value===e)?.label??e}),[O,k]=h.useState(!1),[A,j]=h.useState(!1),[M,N]=h.useState(!1),[P,F]=h.useState(ne??!1),[I,L]=h.useState(null),[Ie,Le]=h.useState(null),[Re,ze]=h.useState(``),R=h.useRef(new oe.Value(0)).current,Be=r!==void 0,z=Be?r:w,Ve=re!==void 0,B=Ve?re:E,He=ne!==void 0,V=He?ne:O,H=ue||(v?.disabled??!1),Ue=v?.errors[t],U=d!==void 0&&d!==``?d:Ue,We=fe||U!==void 0,Ge=v!==null&&v.errorSummary,W=Fe<=m.layoutMaxWidthProse,Ke=h.useMemo(()=>Ne(n),[n]),G=h.useCallback(e=>Ke.find(t=>t.value===e)?.label??e,[Ke]),K=o?Array.isArray(z)?z:z===``?[]:[z]:[],q=!o&&typeof z==`string`&&z!==``?z:void 0,qe=o?K.length>0:q!==void 0,Je=h.useRef(o?void 0:z);h.useEffect(()=>{o||Ve||typeof z!=`string`||Je.current===z||(Je.current=z,D(z===``?``:G(z)))},[o,Ve,z,G]);let J=B.trim(),Y=p(J),Ye=h.useMemo(()=>{if(l===`none`||l===`async`||A||Y===``)return n;let e=e=>l===`startsWith`?p(e.label).startsWith(Y):p(e.label).includes(Y);return n.reduce((t,n)=>{if(Me(n)){let r=n.options.filter(e);r.length>0&&t.push({group:n.group,options:r})}else e(n)&&t.push(n);return t},[])},[n,l,A,Y]),Xe=l===`none`&&Y!==``?Ke.find(e=>!e.disabled&&p(e.label).startsWith(Y))?.value:void 0,X=l===`async`&&ge,Ze=e=>{let t=p(e);return Ke.find(e=>p(e.label)===t||p(e.value)===t)},Qe=Ze(J),$e=c&&!X&&J!==``&&Qe===void 0?{value:`${Pe}${J}`,label:_.addCustom.replace(`{value}`,J)}:null,et=X?[]:Ye,tt=$e===null?et:[$e,...et],nt=Ne(et).length,rt=h.useCallback(t=>d!==void 0&&d!==``?d:ce&&(Array.isArray(t)?t.length===0:t===``)?_.required.replace(`{label}`,e):fe?_.invalid.replace(`{label}`,e):null,[ce,e,d,fe]),it=e=>{e!==V&&(He||k(e),e||j(!1),ke?.(e))},at=h.useRef({currentValue:z,validateValue:rt,changeOpen:it});at.current={currentValue:z,validateValue:rt,changeOpen:it};let ot=h.useMemo(()=>({getValue:()=>{let e=at.current.currentValue;return Array.isArray(e)?e.length>0?e.join(`,`):void 0:e===``?void 0:e},validate:()=>at.current.validateValue(at.current.currentValue),focus:()=>{if(W){at.current.changeOpen(!0);return}let e=S.current;if(e===null)return;e.focus();let t=_e(e);t!=null&&Se.setAccessibilityFocus(t)}}),[W]),st=v?.register,ct=v?.unregister;h.useEffect(()=>{if(!(st===void 0||ct===void 0||H))return st(t,ot),()=>ct(t)},[st,ct,t,ot,H]),h.useEffect(()=>{ie.OS===`ios`&&!Ge&&U!==void 0&&Se.announceForAccessibility(U)},[U,Ge]);let lt=m.motionDurationBase*2;h.useEffect(()=>{if(!V){ze(``);return}let e=X?_.loading:nt===0?_.empty:je(nt),t=setTimeout(()=>{ze(e),ie.OS===`ios`&&Se.announceForAccessibility(e)},lt);return()=>clearTimeout(t)},[V,X,nt,lt]);let ut=()=>{let e=x.current?_e(x.current):null;e!=null&&Se.setAccessibilityFocus(e)},Z=e=>{V&&(it(!1),e&&ut())},Q=e=>{Be||T(e),Te?.(e),v!==null&&v.validateMode!==`submit`&&v.reportValidity(t,rt(e))},$=e=>{Ve||D(e),De?.(e)},dt=e=>e.startsWith(Pe)?e.slice(23):e,ft=e=>{if(j(!1),o){let t=(Array.isArray(e)?e:[e]).map(dt);Q(Array.from(new Set(t))),$(``);return}let t=Array.isArray(e)?e[0]:e,n=t===void 0?``:dt(t);Q(n),$(n===``?``:G(n)),Z(!W)},pt=()=>{H||(V?Z(!0):(j(!0),it(!0)))},mt=()=>{H||($(``),Q(o?[]:``))},ht=e=>{H||Q(K.filter(t=>t!==e))},gt=e=>{let t=e.trim();if(t===``)return!1;let n=Ze(t);if(n?.disabled===!0||n===void 0&&!c)return!1;let r=n?.value??t;return o?(K.includes(r)||Q([...K,r]),$(``)):(r!==q&&Q(r),$(n?.label??t),Z(!1)),!0},_t=e=>{if(j(!1),c&&e.includes(`,`)){let t=e.slice(0,e.indexOf(`,`));gt(t)||$(t.trim()===``?``:t);return}$(e),!V&&!H&&it(!0)},vt=()=>{c&&gt(B)},yt=e=>{let t=e.nativeEvent.key;if(t===`Backspace`&&o&&B===``&&K.length>0){Q(K.slice(0,-1));return}t===`Escape`&&(V?Z(!1):be&&B!==``&&$(``))},bt=()=>{N(!0)},xt=()=>{N(!1),W||Z(!1),v!==null&&v.validateMode===`blur`&&v.reportValidity(t,rt(z))};h.useEffect(()=>{V&&F(!0)},[V]);let St=e=>{Le(e.nativeEvent.layout.height)},Ct=f?.fieldBorderInvalid?i(m,f.fieldBorderInvalid):m.colorBorderDanger,wt=f?.fieldBorderWidth?i(m,f.fieldBorderWidth):m.borderWidthThin,Tt=f?.fieldRadius?i(m,f.fieldRadius):m.radiusMd,Et=f?.fieldPaddingInline?i(m,f.fieldPaddingInline):m.spaceMd,Dt=f?.fieldPaddingBlock?i(m,f.fieldPaddingBlock):m.spaceSm,Ot=f?.fieldGap?i(m,f.fieldGap):m.layoutGapTight,kt=f?.chipRadius?i(m,f.chipRadius):m.radiusFull,At=f?.chipPaddingInline?i(m,f.chipPaddingInline):m.space2,jt=f?.chipPaddingBlock?i(m,f.chipPaddingBlock):m.space0,Mt=f?.chipGap?i(m,f.chipGap):m.layoutGapTight,Nt=f?.partGap?i(m,f.partGap):m.space1,Pt=f?.popupSurface?i(m,f.popupSurface):m.colorOverlaySurface,Ft=f?.popupBorder?i(m,f.popupBorder):m.colorBorder,It=f?.popupBorderWidth?i(m,f.popupBorderWidth):m.borderWidthThin,Lt=f?.popupShadow?i(m,f.popupShadow):m.shadowOverlay,Rt=f?.popupRadius?i(m,f.popupRadius):m.radiusMd,zt=f?.popupOffset?i(m,f.popupOffset):m.space1,Bt=f?.layer?i(m,f.layer):m.layerDropdown,Vt=f?.disabledOpacity?i(m,f.disabledOpacity):m.opacityDisabled,Ht=f?.enter?i(m,f.enter):m.motionDurationFast,Ut=m.colorForegroundMuted;h.useEffect(()=>{if(W||!P)return;if(V){if(x.current?.measureInWindow((e,t,n,r)=>L({x:e,y:t,width:n,height:r})),y){R.setValue(1);return}let e=oe.timing(R,{toValue:1,duration:Ht,easing:ye(m.motionEasingStandard),useNativeDriver:!1});return e.start(),()=>e.stop()}if(L(null),Le(null),y){R.setValue(0),F(!1);return}let e=oe.timing(R,{toValue:0,duration:Ht,easing:ye(m.motionEasingStandard),useNativeDriver:!1});return e.start(({finished:e})=>{e&&F(!1)}),()=>e.stop()},[V,P,y,W]);let Wt=ce?`${e}${_.requiredIndicator}`:e,Gt=be&&!H&&(qe||B!==``),Kt=q===void 0?ae??``:G(q),qt=!qe,Jt={flexDirection:`column`,gap:Nt,opacity:H?Vt:1},Yt=M?m.borderWidthFocus:wt,Xt=M?m.borderWidthFocus-wt:0,Zt=M?m.colorBorderFocus:We?Ct:m.colorBorderStrong,Qt={flexDirection:`row`,flexWrap:`wrap`,alignItems:`center`,gap:Ot,minHeight:m.sizeTargetComfortable,backgroundColor:m.colorBackground,borderWidth:Yt,borderColor:Zt,borderRadius:Tt,paddingHorizontal:Et-Xt,paddingVertical:Dt-Xt},$t={flexDirection:`row`,alignItems:`center`,flexShrink:1,gap:Mt,backgroundColor:m.colorBackgroundStrong,borderRadius:kt,paddingHorizontal:At,paddingVertical:jt},en=f?.fontSize?i(m,f.fontSize):m.fontSizeMd,tn=f?.lineHeight?i(m,f.lineHeight):m.fontLineHeightNormal,nn={flexGrow:1,flexShrink:1,flexBasis:0,minHeight:m.sizeTargetMin,fontFamily:f?.fontFamily?i(m,f.fontFamily):m.fontFamilyBody,fontSize:en,lineHeight:xe(en,tn),color:m.colorForeground},rn={fontFamily:f?.fontFamily,fontSize:f?.fontSize,fontWeight:f?.labelWeight,lineHeight:f?.lineHeight},an={fontFamily:f?.fontFamily,fontSize:f?.helperSize,lineHeight:f?.lineHeight},on={fontFamily:f?.fontFamily,fontSize:f?.chipSize,lineHeight:f?.lineHeight},sn={fontFamily:f?.fontFamily,fontSize:f?.fontSize,lineHeight:f?.lineHeight},cn={fontFamily:f?.fontFamily,fontSize:f?.fontSize,lineHeight:f?.lineHeight,disabledOpacity:f?.disabledOpacity},ln=(e,t)=>{let n=G(e);return(0,g.jsxs)(a,{style:$t,testID:`Combobox.chip`,children:[(0,g.jsx)(s,{size:`sm`,truncate:!0,overrides:on,children:n}),t?(0,g.jsx)(a,{testID:`Combobox.chipRemove`,children:(0,g.jsx)(Oe,{label:_.removeChip.replace(`{label}`,n),variant:`ghost`,size:`sm`,iconOnly:!0,disabled:H,leadingIcon:(0,g.jsx)(me,{name:`close`,size:`xs`,color:Ut}),onPress:()=>ht(e)})}):null]},e)},un=(0,g.jsx)(pe,{ref:S,accessibilityRole:`combobox`,accessibilityLabel:Wt,accessibilityHint:u,accessibilityState:{disabled:H,expanded:V},accessibilityValue:!o&&q!==void 0?{text:G(q)}:void 0,editable:!H,value:B,placeholder:ae,placeholderTextColor:m.colorForegroundMuted,autoCapitalize:`none`,autoCorrect:!1,autoFocus:W,onChangeText:_t,onFocus:bt,onBlur:xt,onKeyPress:yt,onSubmitEditing:vt,submitBehavior:o?`submit`:`blurAndSubmit`,style:nn,testID:`Combobox.input`}),dn=(0,g.jsx)(a,{testID:`Combobox.listbox`,children:(0,g.jsx)(Ae,{label:e,options:tt,multiple:o,value:o?K:q??``,disabled:H,embedded:!0,loading:X,emptyMessage:_.empty,initialActiveValue:Xe,onChange:ft,overrides:cn})}),fn=(0,g.jsx)(a,{accessibilityLiveRegion:`polite`,testID:`Combobox.status`,children:V&&Re!==``?(0,g.jsx)(s,{size:`sm`,tone:`muted`,overrides:an,children:Re}):null}),pn=I===null?0:b-(I.y+I.height),mn=I===null?0:I.y,hn=Ie??0,gn=I!==null&&pn<hn+zt&&mn>pn,_n=I===null?0:gn?I.y-zt-hn:I.y+I.height+zt,vn={flex:1},yn={position:`absolute`,top:_n,left:I?.x??0,minWidth:I?.width??0,borderRadius:Rt,zIndex:Bt,opacity:R,...Lt},bn={borderRadius:Rt,borderWidth:It,borderColor:Ft,backgroundColor:Pt,overflow:`hidden`},xn={flexDirection:`column`,gap:Ot},Sn={flexDirection:`row`,flexWrap:`wrap`,gap:Ot},Cn=Gt?(0,g.jsx)(a,{testID:`Combobox.clearButton`,children:(0,g.jsx)(Oe,{label:_.clearLabel,variant:`ghost`,size:`sm`,iconOnly:!0,leadingIcon:(0,g.jsx)(me,{name:`close`,size:`xs`,color:Ut}),onPress:mt})}):null;return(0,g.jsxs)(a,{ref:Ce,testID:`Combobox`,style:Jt,children:[(0,g.jsx)(a,{testID:`Combobox.label`,children:(0,g.jsx)(s,{weight:`medium`,overrides:rn,children:Wt})}),u===void 0?null:(0,g.jsx)(a,{testID:`Combobox.description`,children:(0,g.jsx)(s,{size:`sm`,tone:`muted`,overrides:an,children:u})}),W?(0,g.jsxs)(se,{ref:x,accessibilityRole:`combobox`,accessibilityLabel:Wt,accessibilityHint:u,accessibilityState:{disabled:H,expanded:V},accessibilityValue:qe?{text:o?K.map(G).join(`, `):Kt}:void 0,onPress:pt,onFocus:()=>N(!0),onBlur:()=>N(!1),style:Qt,testID:`Combobox.field`,children:[o&&K.length>0?(0,g.jsx)(a,{style:Sn,testID:`Combobox.chips`,children:K.map(e=>ln(e,!1))}):(0,g.jsx)(s,{tone:qt?`muted`:`default`,truncate:!0,overrides:sn,children:Kt}),(0,g.jsx)(a,{testID:`Combobox.toggleButton`,accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,children:(0,g.jsx)(me,{name:`chevron-down`,size:`xs`,color:Ut})})]}):(0,g.jsxs)(a,{ref:x,style:Qt,testID:`Combobox.field`,children:[o&&K.length>0?(0,g.jsx)(a,{style:Sn,testID:`Combobox.chips`,children:K.map(e=>ln(e,!0))}):null,un,Cn,(0,g.jsx)(a,{testID:`Combobox.toggleButton`,children:(0,g.jsx)(Oe,{label:_.toggleLabel,variant:`ghost`,size:`sm`,iconOnly:!0,expanded:V,disabled:H,leadingIcon:(0,g.jsx)(me,{name:`chevron-down`,size:`xs`,color:Ut}),onPress:pt})})]}),W?null:fn,U===void 0?null:(0,g.jsx)(a,{accessibilityLiveRegion:Ge?`none`:`assertive`,testID:`Combobox.errorMessage`,children:(0,g.jsx)(s,{size:`sm`,tone:`danger`,overrides:an,children:U})}),W?(0,g.jsx)(le,{open:V,heading:e,height:`full`,onClose:()=>Z(!0),footer:(0,g.jsx)(Oe,{label:_.done,onPress:()=>Z(!0)}),children:(0,g.jsxs)(a,{style:xn,testID:`Combobox.popup`,children:[o&&K.length>0?(0,g.jsx)(a,{style:Sn,testID:`Combobox.chips`,children:K.map(e=>ln(e,!0))}):null,(0,g.jsxs)(a,{style:Qt,children:[un,Cn]}),fn,dn]})}):(0,g.jsx)(de,{visible:P,transparent:!0,animationType:`none`,onRequestClose:()=>Z(!0),statusBarTranslucent:!0,children:(0,g.jsxs)(a,{style:vn,children:[(0,g.jsx)(se,{style:ee.absoluteFill,onPress:()=>Z(!0),accessible:!1,testID:`Combobox.scrim`}),I===null?null:(0,g.jsx)(oe.View,{style:yn,onLayout:St,testID:`Combobox.popup`,children:(0,g.jsx)(a,{style:bn,children:dn})})]})})]})}var h,g,_,Pe;function v(){return(v=e((()=>{h=t(n(),1),f(),ae(),ue(),l(),u(),r(),fe(),ne(),ge(),te(),ce(),De(),Te(),d(),ke(),o(),Ce(),g=be(),_={empty:`No matches`,loading:`Loading…`,addCustom:`Add "{value}"`,clearLabel:`Clear`,toggleLabel:`Show options`,done:`Done`,removeChip:`Remove {label}`,resultCount:{one:`{count} result available`,other:`{count} results available`},activeOption:`{option}`,required:`{label} is required.`,invalid:`{label} is not valid.`,requiredIndicator:` (required)`},Pe=`__ds_combobox_custom__:`,m.__docgenInfo={description:'Combobox — an input that narrows as you type and lets you pick, or, with\n`allowCustom`, keep what you typed.\n\nWhen to use: long lists (fifty-plus), values typed faster than found, `async`\nsearch against a server, and multi-value fields where chips make the selection\nlegible. Use Select for short static lists.\n\nComposes the same `Listbox` engine as `Select` (`embedded`). On phones the field is\na `Pressable` summary (chips read-only) that opens a `BottomSheet height="full"`\nwith the chips and the `TextInput` at the top of its body, the `Listbox` below and\na `copy.done` footer Button; on tablets and react-native-web the field holds the\n`TextInput` directly and the popup is an anchored `Modal` below it (flipped above on\noverflow) that does not trap focus. Listbox rows are touch `Pressable`s with no key\nevents, so arrow browsing, Alt+ArrowDown and Tab-without-committing have no native\nequivalent: a tap commits, Enter or a comma through the `TextInput` commits typed\ncustom text, Escape (hardware keyboard / react-native-web) closes then clears the\ntext, and blurring the anchored field closes the list. Result counts, loading and\nempty states are announced with `AccessibilityInfo.announceForAccessibility` after\n`motion.duration.base × 2`. Validation and Form registration work as `Input`\'s:\n`error` prop → `required` → `invalid`.',methods:[],displayName:`Combobox`,props:{label:{required:!0,tsType:{name:`string`},description:"Visible label. Always rendered. Also the input's `accessibilityLabel`."},name:{required:!0,tsType:{name:`string`},description:`Field name for the Form.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`ListboxOption | ListboxGroup`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
| 'dash'
| 'chevron-right'
| 'chevron-down'
| 'chevron-up'
| 'chevron-left'
| 'close'
| 'plus'
| 'minus'
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'external'
| 'ellipsis'
| 'search'
| 'arrow-right'
| 'arrow-left'
| 'calendar'
| 'menu'
| 'list'
| 'grid'
| 'play'
| 'pause'
| 'folder'
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}},{name:`signature`,type:`object`,raw:`{ group: string; options: ListboxOption[] }`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`options`,value:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
| 'dash'
| 'chevron-right'
| 'chevron-down'
| 'chevron-up'
| 'chevron-left'
| 'close'
| 'plus'
| 'minus'
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'external'
| 'ellipsis'
| 'search'
| 'arrow-right'
| 'arrow-left'
| 'calendar'
| 'menu'
| 'list'
| 'grid'
| 'play'
| 'pause'
| 'folder'
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ListboxOption[]`,required:!0}}]}}]}],raw:`ListboxItem[]`},description:"The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering."},value:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry."},defaultValue:{required:!1,tsType:{name:`union`,raw:`string | string[] | undefined`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initial value(s).`},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default.`},inputValue:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering."},multiple:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip.`,defaultValue:{value:`false`,computed:!1}},allowCustom:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma commits it; the list shows `copy.addCustom` as a synthetic first row.",defaultValue:{value:`false`,computed:!1}},filter:{required:!1,tsType:{name:`union`,raw:`ComboboxFilter | undefined`,elements:[{name:`union`,raw:`'startsWith' | 'contains' | 'none' | 'async'`,elements:[{name:`literal`,value:`'startsWith'`},{name:`literal`,value:`'contains'`},{name:`literal`,value:`'none'`},{name:`literal`,value:`'async'`}]},{name:`undefined`}]},description:"How typing narrows `options`: by prefix, by substring (default), not at all (type-ahead), or by the consumer (`async`).",defaultValue:{value:`'contains'`,computed:!1}},placeholder:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Example input shown while empty. Never the only description.`},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Helper text under the label. Also the input's `accessibilityHint`."},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Must have a value to submit.`,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not editable, not submitted, still readable and focusable.`,defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Marks the field invalid.`,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message; implies invalid.`},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"For `async`: show the loading row and announce it. The consumer sets it around its request.",defaultValue:{value:`false`,computed:!1}},clearable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show a clear button when there is a value or text.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'fieldBorderInvalid'
| 'fieldBorderWidth'
| 'fieldRadius'
| 'fieldPaddingInline'
| 'fieldPaddingBlock'
| 'fieldGap'
| 'chipRadius'
| 'chipPaddingInline'
| 'chipPaddingBlock'
| 'chipGap'
| 'partGap'
| 'labelWeight'
| 'helperSize'
| 'popupSurface'
| 'popupBorder'
| 'popupBorderWidth'
| 'popupShadow'
| 'popupRadius'
| 'popupOffset'
| 'layer'
| 'fontFamily'
| 'fontSize'
| 'chipSize'
| 'lineHeight'
| 'disabledOpacity'
| 'enter'`,elements:[{name:`literal`,value:`'fieldBorderInvalid'`},{name:`literal`,value:`'fieldBorderWidth'`},{name:`literal`,value:`'fieldRadius'`},{name:`literal`,value:`'fieldPaddingInline'`},{name:`literal`,value:`'fieldPaddingBlock'`},{name:`literal`,value:`'fieldGap'`},{name:`literal`,value:`'chipRadius'`},{name:`literal`,value:`'chipPaddingInline'`},{name:`literal`,value:`'chipPaddingBlock'`},{name:`literal`,value:`'chipGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'popupSurface'`},{name:`literal`,value:`'popupBorder'`},{name:`literal`,value:`'popupBorderWidth'`},{name:`literal`,value:`'popupShadow'`},{name:`literal`,value:`'popupRadius'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'chipSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'enter'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ComboboxOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root view.`},onChange:{required:!1,tsType:{name:`union`,raw:`((value: string | string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`)."},onInputChange:{required:!1,tsType:{name:`union`,raw:`((value: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on every keystroke with the input text. The hook for `async` filtering."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the list opens or closes.`}}}})))()}var y,Fe,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,Ie;function Le(){return(Le=e((()=>{v(),c(),y=[{value:`apple`,label:`Apple`},{value:`apricot`,label:`Apricot`},{value:`banana`,label:`Banana`}],Fe={title:`Combobox/React Native`,component:m,decorators:[re()],args:{label:`Fruit`,name:`fruit`,options:y,filter:`contains`,multiple:!1,allowCustom:!1,required:!1,disabled:!1,invalid:!1,loading:!1,clearable:!0}},b={},x={args:{filter:`startsWith`}},S={args:{filter:`contains`}},C={args:{filter:`none`}},w={args:{filter:`async`}},T={args:{label:`Fruit`,name:`fruit`,options:y}},E={args:{label:`Roles`,name:`roles`,multiple:!0,defaultValue:[`frontend`],options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},D={args:{label:`Tags`,name:`tags`,multiple:!0,allowCustom:!0,options:[{value:`urgent`,label:`Urgent`},{value:`billing`,label:`Billing`}]}},O={args:{label:`Customer`,name:`customer`,filter:`async`,loading:!0,options:[{value:`acme`,label:`Acme Ltd`}]}},k={args:{options:[{group:`Pome`,options:[{value:`apple`,label:`Apple`}]},{group:`Stone`,options:[{value:`apricot`,label:`Apricot`},{value:`cherry`,label:`Cherry`}]}]}},A={args:{options:[]}},j={args:{defaultValue:`apple`,clearable:!1}},M={args:{required:!0}},N={args:{disabled:!0,defaultValue:`apple`}},P={args:{invalid:!0}},F={args:{error:`Choose a fruit.`}},I={args:{description:`Pick the one you want delivered.`,placeholder:`Search fruit`}},L={args:{open:!0,options:y}},Ie=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`FruitPicker`,`MultiSelectWithChips`,`FreeTextTags`,`AsyncResults`,`Grouped`,`Empty`,`ClearableFalse`,`Required`,`Disabled`,`Invalid`,`WithError`,`WithDescription`,`Keyboard`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: FRUIT
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [{
      value: 'frontend',
      label: 'Frontend'
    }, {
      value: 'backend',
      label: 'Backend'
    }, {
      value: 'design',
      label: 'Design'
    }]
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    options: [{
      value: 'urgent',
      label: 'Urgent'
    }, {
      value: 'billing',
      label: 'Billing'
    }]
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Customer',
    name: 'customer',
    filter: 'async',
    loading: true,
    options: [{
      value: 'acme',
      label: 'Acme Ltd'
    }]
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    options: [{
      group: 'Pome',
      options: [{
        value: 'apple',
        label: 'Apple'
      }]
    }, {
      group: 'Stone',
      options: [{
        value: 'apricot',
        label: 'Apricot'
      }, {
        value: 'cherry',
        label: 'Cherry'
      }]
    }]
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    options: []
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'apple',
    clearable: false
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'apple'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose a fruit.'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Pick the one you want delivered.',
    placeholder: 'Search fruit'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    options: FRUIT
  }
}`,...L.parameters?.docs?.source},description:{story:`Rendered open with the input, the toggle button and three option rows, for the axe gate and manual keyboard checks on react-native-web.`,...L.parameters?.docs?.description}}}})))()}Le();export{O as AsyncResults,j as ClearableFalse,b as Default,N as Disabled,A as Empty,w as FilterAsync,S as FilterContains,C as FilterNone,x as FilterStartsWith,D as FreeTextTags,T as FruitPicker,k as Grouped,P as Invalid,L as Keyboard,E as MultiSelectWithChips,M as Required,I as WithDescription,F as WithError,Ie as __namedExportsOrder,Fe as default};