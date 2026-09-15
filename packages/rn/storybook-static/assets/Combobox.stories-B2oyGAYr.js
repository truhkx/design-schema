import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{U as r,W as ee,c as te,i,n as ne,r as a,s as o,t as re}from"./decorators-By8OYT78.js";import{i as s,r as ie}from"./TextInputState-DM2YsbWP.js";import{n as ae,t as oe}from"./Animated-BOjZfQPp.js";import{r as c,t as l}from"./Text-DmAQvf2u.js";import{n as u,t as se}from"./Pressable-CA1DfulA.js";import{n as ce,t as le}from"./Modal-Bct3sUeM.js";import{n as ue,t as de}from"./TextInput-D6faX2zv.js";import{n as fe,t as d}from"./useWindowDimensions-8YBQGAqW.js";import{t as pe}from"./react-native-web-CSYCdYxT.js";import{c as me,i as he,l as f,m as ge,p as _e,r as p,s as ve}from"./iframe-DN6Wi5u4.js";import{n as ye,r as be}from"./FormContext-3EoEHyqs.js";import{n as xe,t as m}from"./Button-DLGJ8fI_.js";import{n as h,t as g}from"./Icon-DLOggmPG.js";import{n as _,t as Se}from"./BottomSheet-DgzEa4VF.js";import{n as v,t as Ce}from"./Listbox-9CanJcma.js";function we(e){return`group`in e}function Te(e){let t=[];return e.forEach(e=>{we(e)?t.push(...e.options):t.push(e)}),t}function y({label:e,name:t,options:n,value:r,defaultValue:te,inputValue:ne,multiple:a=!1,allowCustom:re=!1,filter:s=`contains`,placeholder:ae,description:c,required:u=!1,disabled:ce=!1,invalid:ue=!1,error:d,loading:f=!1,clearable:ge=!0,overrides:p,onChange:ye,onInputChange:xe,onOpenChange:h}){let{tokens:_}=me(),v=be(),y=ve(),{width:De,height:Oe}=fe(),C=b.useRef(null),w=b.useRef(null),T=a?[]:``,[E,D]=b.useState(te??T),[O,k]=b.useState(``),[A,j]=b.useState(!1),[M,N]=b.useState(!1),[P,F]=b.useState(!1),[I,L]=b.useState(null),[R,z]=b.useState(null),B=b.useRef(new oe.Value(0)).current,V=r!==void 0,H=V?r:E,ke=ne!==void 0,U=ke?ne:O,W=ce||(v?.disabled??!1),Ae=v?.errors[t],G=d!==void 0&&d!==``?d:Ae,je=ue||G!==void 0,Me=v!==null&&v.errorSummary,K=De<=_.layoutMaxWidthProse,Ne=b.useMemo(()=>Te(n),[n]),Pe=b.useCallback(e=>Ne.find(t=>t.value===e)?.label??e,[Ne]),q=a&&Array.isArray(H)?H:[],Fe=!a&&typeof H==`string`&&H!==``?H:void 0,Ie=a?q.length>0:Fe!==void 0,J=U.trim(),Le=b.useMemo(()=>{if(s===`none`||s===`async`||J===``)return n;let e=J.toLowerCase(),t=t=>s===`startsWith`?t.label.toLowerCase().startsWith(e):t.label.toLowerCase().includes(e);return n.reduce((e,n)=>{if(we(n)){let r=n.options.filter(t);r.length>0&&e.push({group:n.group,options:r})}else t(n)&&e.push(n);return e},[])},[n,s,J]),Re=Ne.some(e=>e.label.toLowerCase()===J.toLowerCase()||e.value.toLowerCase()===J.toLowerCase()),ze=re&&J!==``&&!Re?{value:`${Ee}${J}`,label:S.addCustom(J)}:null,Be=ze===null?Le:[ze,...Le],Y=Te(Le).length,Ve=b.useCallback(t=>d!==void 0&&d!==``?d:u&&(a?!Array.isArray(t)||t.length===0:t===``)?S.required(e):ue?S.invalid(e):null,[u,a,e,d,ue]),He=b.useCallback(()=>{let e=C.current?pe(C.current):null;e!=null&&_e.setAccessibilityFocus(e)},[]),Ue=b.useRef({currentValue:H,validateValue:Ve});Ue.current={currentValue:H,validateValue:Ve};let We=b.useMemo(()=>({getValue:()=>{let e=Ue.current.currentValue;return a?Array.isArray(e)&&e.length>0?e:void 0:typeof e==`string`&&e!==``?e:void 0},validate:()=>Ue.current.validateValue(Ue.current.currentValue),focus:()=>{if(K){N(!0),h?.(!0);return}let e=w.current;if(e===null)return;e.focus();let t=pe(e);t!=null&&_e.setAccessibilityFocus(t)}}),[a,K,h]),Ge=v?.register,Ke=v?.unregister;b.useEffect(()=>{if(!(Ge===void 0||Ke===void 0||W))return Ge(t,We),()=>Ke(t)},[Ge,Ke,t,We,W]),b.useEffect(()=>{ie.OS===`ios`&&!Me&&G!==void 0&&_e.announceForAccessibility(G)},[G,Me]),b.useEffect(()=>{if(!M)return;let e=s===`async`&&f?S.loading:Y===0?S.empty:S.resultCount(Y),t=setTimeout(()=>{_e.announceForAccessibility(e)},_.motionDurationBase*2);return()=>clearTimeout(t)},[M,s,f,Y,_.motionDurationBase]);let X=e=>{N(e),h?.(e)},Z=e=>{M&&(X(!1),e&&He())},Q=e=>{V||D(e),ye?.(e),v!==null&&v.validateMode!==`submit`&&v.reportValidity(t,Ve(e))},$=e=>{ke||k(e),xe?.(e)},qe=e=>e.startsWith(Ee)?e.slice(23):e,Je=e=>{if(a){let t=(Array.isArray(e)?e:[e]).map(qe);Q(t),$(``);return}let t=Array.isArray(e)?e[0]:e,n=t===void 0?``:qe(t);Q(n),$(n===``?``:Pe(n)),Z(!1)},Ye=()=>{W||(M?Z(!0):X(!0))},Xe=()=>{W||($(``),Q(a?[]:``))},Ze=e=>{W||Q(q.filter(t=>t!==e))},Qe=e=>{$(e),M||X(!0)},$e=()=>{re&&J!==``&&(a?(q.includes(J)||Q([...q,J]),$(``)):(Q(J),$(J),Z(!1)))},et=()=>{$e()},tt=e=>{let t=e.nativeEvent.key;if(t===`Backspace`&&a&&U===``&&q.length>0){Q(q.slice(0,-1));return}t===`Escape`&&(M?Z(!0):ge&&Xe())},nt=()=>{j(!0),M||X(!0)},rt=()=>{j(!1),Z(!1),v!==null&&v.validateMode===`blur`&&v.reportValidity(t,Ve(H))};b.useEffect(()=>{M&&F(!0)},[M]);let it=e=>{z(e.nativeEvent.layout.height)},at=p?.fieldBorderFocus?i(_,p.fieldBorderFocus):_.colorBorderFocus,ot=p?.fieldBorderInvalid?i(_,p.fieldBorderInvalid):_.colorBorderDanger,st=p?.fieldBorderWidth?i(_,p.fieldBorderWidth):_.borderWidthThin,ct=p?.fieldRadius?i(_,p.fieldRadius):_.radiusMd,lt=p?.fieldPaddingInline?i(_,p.fieldPaddingInline):_.spaceMd,ut=p?.fieldPaddingBlock?i(_,p.fieldPaddingBlock):_.spaceSm,dt=p?.fieldGap?i(_,p.fieldGap):_.layoutGapTight,ft=p?.chipRadius?i(_,p.chipRadius):_.radiusFull,pt=p?.chipPaddingInline?i(_,p.chipPaddingInline):_.space2,mt=p?.chipPaddingBlock?i(_,p.chipPaddingBlock):_.space0,ht=p?.chipGap?i(_,p.chipGap):_.layoutGapTight,gt=p?.partGap?i(_,p.partGap):_.space1;p?.labelWeight?i(_,p.labelWeight):_.fontWeightMedium;let _t=p?.popupSurface?i(_,p.popupSurface):_.colorOverlaySurface,vt=p?.popupBorder?i(_,p.popupBorder):_.colorBorder,yt=p?.popupShadow?i(_,p.popupShadow):_.shadowOverlay,bt=p?.popupRadius?i(_,p.popupRadius):_.radiusMd,xt=p?.popupOffset?i(_,p.popupOffset):_.space1,St=p?.layer?i(_,p.layer):_.layerDropdown,Ct=p?.disabledOpacity?i(_,p.disabledOpacity):_.opacityDisabled,wt=p?.enter?i(_,p.enter):_.motionDurationFast,Tt=_.colorForegroundMuted;b.useEffect(()=>{if(K||!P)return;if(M){if(C.current?.measureInWindow((e,t,n,r)=>L({x:e,y:t,width:n,height:r})),y){B.setValue(1);return}let e=oe.timing(B,{toValue:1,duration:wt,easing:he(_.motionEasingStandard),useNativeDriver:!1});return e.start(),()=>e.stop()}if(L(null),z(null),y){B.setValue(0),F(!1);return}let e=oe.timing(B,{toValue:0,duration:wt,easing:he(_.motionEasingStandard),useNativeDriver:!1});return e.start(({finished:e})=>{e&&F(!1)}),()=>e.stop()},[M,P,y,K]);let Et=u?`${e}${S.requiredIndicator}`:e,Dt=ge&&!W&&(Ie||U!==``),Ot=Fe===void 0?ae??``:Pe(Fe),kt=Fe===void 0&&!Ie,At={flexDirection:`column`,gap:gt,opacity:W?Ct:1},jt=_.borderWidthFocus-st,Mt=A?_.borderWidthFocus:st,Nt=A?at:je?ot:_.colorBorderStrong,Pt={flexDirection:`row`,flexWrap:`wrap`,alignItems:`center`,gap:dt,minHeight:_.sizeTargetComfortable,backgroundColor:_.colorBackground,borderWidth:Mt,borderColor:Nt,borderRadius:ct,paddingHorizontal:lt+jt,paddingVertical:ut+jt},Ft={flexDirection:`row`,alignItems:`center`,gap:ht,backgroundColor:_.colorBackgroundStrong,borderRadius:ft,paddingHorizontal:pt,paddingVertical:mt},It={flexGrow:1,flexShrink:1,flexBasis:0,fontFamily:p?.fontFamily?i(_,p.fontFamily):_.fontFamilyBody,fontSize:p?.fontSize?i(_,p.fontSize):_.fontSizeMd,color:_.colorForeground},Lt={fontFamily:p?.fontFamily,fontSize:p?.fontSize,fontWeight:p?.labelWeight,lineHeight:p?.lineHeight},Rt={fontFamily:p?.fontFamily,fontSize:p?.helperSize,lineHeight:p?.lineHeight},zt={fontFamily:p?.fontFamily,fontSize:p?.chipSize,lineHeight:p?.lineHeight},Bt={fontFamily:p?.fontFamily,fontSize:p?.fontSize,lineHeight:p?.lineHeight},Vt={fontFamily:p?.fontFamily,fontSize:p?.fontSize,lineHeight:p?.lineHeight,disabledOpacity:p?.disabledOpacity},Ht=s===`async`&&f?S.loading:S.empty,Ut=(e,t)=>{let n=Pe(e);return(0,x.jsxs)(o,{style:Ft,testID:`Combobox.chip`,children:[(0,x.jsx)(l,{size:`sm`,overrides:zt,children:n}),t?(0,x.jsx)(m,{label:S.removeChip(n),variant:`ghost`,size:`sm`,iconOnly:!0,disabled:W,leadingIcon:(0,x.jsx)(g,{name:`close`,size:`xs`,color:Tt}),onPress:()=>Ze(e)}):null]},e)},Wt=(0,x.jsx)(de,{ref:w,accessibilityRole:`combobox`,accessibilityLabel:Et,accessibilityHint:c,accessibilityState:{disabled:W,expanded:M},editable:!W,value:U,placeholder:ae,placeholderTextColor:_.colorForegroundMuted,autoCapitalize:`none`,autoCorrect:!1,allowFontScaling:!0,onChangeText:Qe,onFocus:nt,onBlur:rt,onKeyPress:tt,onSubmitEditing:et,style:It,testID:`Combobox.input`}),Gt=(0,x.jsx)(Ce,{label:e,options:Be,multiple:a,value:H,disabled:W,embedded:!0,emptyMessage:Ht,onChange:Je,overrides:Vt}),Kt=s===`async`&&f?S.loading:Y===0?S.empty:S.resultCount(Y),qt=M?(0,x.jsx)(o,{accessibilityLiveRegion:`polite`,importantForAccessibility:`yes`,testID:`Combobox.status`,children:(0,x.jsx)(l,{size:`xs`,tone:`muted`,overrides:Rt,children:Kt})}):null,Jt=I===null?0:Oe-(I.y+I.height),Yt=I===null?0:I.y,Xt=R??0,Zt=I!==null&&Jt<Xt+xt&&Yt>Jt,Qt=I===null?0:Zt?I.y-xt-Xt:I.y+I.height+xt,$t=I?.x??0,en=I?.width,tn={flex:1},nn={position:`absolute`,top:Qt,left:$t,width:en,borderRadius:bt,zIndex:St,opacity:B,...yt},rn={borderRadius:bt,borderWidth:_.borderWidthThin,borderColor:vt,backgroundColor:_t,overflow:`hidden`},an={flexDirection:`row`,flexWrap:`wrap`,gap:dt,marginBottom:_.space2};return(0,x.jsxs)(o,{testID:`Combobox`,style:At,children:[(0,x.jsx)(l,{weight:`medium`,overrides:Lt,children:Et}),c===void 0?null:(0,x.jsx)(l,{size:`sm`,tone:`muted`,overrides:Rt,children:c}),K?(0,x.jsxs)(se,{ref:C,accessibilityRole:`combobox`,accessibilityLabel:Et,accessibilityHint:c,accessibilityState:{disabled:W,expanded:M},accessibilityValue:!a&&Ie?{text:Ot}:void 0,onPress:Ye,onFocus:()=>j(!0),onBlur:()=>j(!1),style:Pt,testID:`Combobox.field`,children:[a?q.map(e=>Ut(e,!1)):null,!a||q.length===0?(0,x.jsx)(l,{tone:kt?`muted`:`default`,overrides:Bt,children:Ot}):null,(0,x.jsx)(g,{name:`chevron-down`,size:`xs`,color:Tt})]}):(0,x.jsxs)(o,{ref:C,style:Pt,testID:`Combobox.field`,children:[a?q.map(e=>Ut(e,!0)):null,Wt,Dt?(0,x.jsx)(m,{label:S.clearLabel,variant:`ghost`,size:`sm`,iconOnly:!0,leadingIcon:(0,x.jsx)(g,{name:`close`,size:`xs`,color:Tt}),onPress:Xe}):null,(0,x.jsx)(m,{label:S.toggleLabel,variant:`ghost`,size:`sm`,iconOnly:!0,disabled:W,leadingIcon:(0,x.jsx)(g,{name:`chevron-down`,size:`xs`,color:Tt}),onPress:Ye})]}),qt,G===void 0?null:(0,x.jsx)(o,{accessibilityLiveRegion:Me?`none`:`assertive`,testID:`Combobox.errorMessage`,children:(0,x.jsx)(l,{size:`sm`,tone:`danger`,overrides:Rt,children:G})}),K?(0,x.jsxs)(Se,{open:M,heading:e,onClose:()=>Z(!0),footer:a?(0,x.jsx)(m,{label:S.done,onPress:()=>Z(!0)}):void 0,children:[(0,x.jsxs)(x.Fragment,{children:[a&&q.length>0?(0,x.jsx)(o,{style:an,children:q.map(e=>Ut(e,!0))}):null,Wt]}),Gt]}):(0,x.jsx)(le,{visible:P,transparent:!0,animationType:`none`,onRequestClose:()=>Z(!0),statusBarTranslucent:!0,children:(0,x.jsxs)(o,{style:tn,children:[(0,x.jsx)(se,{style:ee.absoluteFill,onPress:()=>Z(!0),accessible:!1,testID:`Combobox.scrim`}),I===null?null:(0,x.jsx)(oe.View,{style:nn,onLayout:it,testID:`Combobox.popup`,children:(0,x.jsx)(o,{style:rn,children:Gt})})]})})]})}var b,x,S,Ee;function De(){return(De=e((()=>{b=t(n(),1),ge(),ae(),ce(),s(),u(),r(),ue(),te(),d(),a(),_(),xe(),ye(),h(),v(),c(),p(),x=f(),S={empty:`No matches`,loading:`Loading…`,addCustom:e=>`Add "${e}"`,clearLabel:`Clear`,toggleLabel:`Show options`,removeChip:e=>`Remove ${e}`,resultCount:e=>`${e} results available`,required:e=>`${e} is required.`,invalid:e=>`${e} is not valid.`,requiredIndicator:` (required)`,done:`Done`},Ee=`__ds_combobox_custom__:`,y.__docgenInfo={description:"Combobox — an input that narrows as you type and lets you pick, or, with\n`allowCustom`, keep what you typed.\n\nWhen to use: Use for long lists (fifty-plus), for values typed faster than found\n(dates, codes), for `async` search against a server, and for multi-value fields\nwhere chips make the selection legible. Use `allowCustom` when new values are\nlegitimate (tags, invitees). Do not use it for short static lists (Select) or to\nnavigate to search results (a search form).\n\nComposes the same `Listbox` engine `Select` uses for its popup. On phones the\nfield is a `Pressable` summary (chips read-only, for glanceability) that opens a\n`BottomSheet` containing the real `TextInput` (autofocused by the sheet's own\n`FocusScope`) above the `Listbox`, with a `Done` footer action under `multiple`;\non tablets and react-native-web the field holds the `TextInput` directly and the\npopup is an anchored `Modal` positioned below it (flipped above on overflow),\ndeliberately not focus-trapping, since focus must stay in the input while the\nlist is browsed by touch. Typing filters `options` per `filter` and opens the\nlist; selecting a row commits and, single-select, closes the popup, while\n`multiple` adds a chip, clears the text and stays open. `allowCustom` injects a\nsynthetic first row (`copy.addCustom`) into the Listbox's own `options` when the\ntyped text matches nothing, so committing it needs no engine change. Because\n`Listbox`'s own rows are touch `Pressable`s with no key-event API, the web\nkeyboard model's arrow-key/Home/End active-option browsing and Tab-does-not-commit\nbehavior have no native equivalent (the same acknowledged limit `Listbox`\ndocuments); only Escape (closes, then clears — reachable via a hardware/RNW\nkeyboard), Enter (commits typed custom text via `onSubmitEditing`) and Backspace\non an empty `multiple` input (removes the last chip, via `onKeyPress`) are wired.\nResult counts, loading and empty states are announced with\n`AccessibilityInfo.announceForAccessibility`, debounced. Validation and Form\nregistration work as `Input`'s: precedence is `error` prop → `required` →\n`invalid`.",methods:[],displayName:`Combobox`,props:{label:{required:!0,tsType:{name:`string`},description:"Visible label. Always rendered. Also the field's `accessibilityLabel`."},name:{required:!0,tsType:{name:`string`},description:`Field name for the Form.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`ListboxOption | ListboxGroup`,elements:[{name:`signature`,type:`object`,raw:`{
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
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ListboxOption[]`,required:!0}}]}}]}],raw:`ListboxItem[]`},description:"The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering."},value:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:"Controlled selected value(s) (array with `multiple`). With `allowCustom`, a value not in `options` is a custom entry."},defaultValue:{required:!1,tsType:{name:`union`,raw:`ComboboxValue | undefined`,elements:[{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},{name:`undefined`}]},description:`Initial selected value(s).`},inputValue:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering."},multiple:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Pick many: selected options appear as chips before the input, each removable; the list stays open while toggling; Backspace in an empty input removes the last chip.`,defaultValue:{value:`false`,computed:!1}},allowCustom:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Typed text that matches no option can be committed as a value. Enter commits it; the list shows `copy.addCustom` as the first row.",defaultValue:{value:`false`,computed:!1}},filter:{required:!1,tsType:{name:`union`,raw:`ComboboxFilter | undefined`,elements:[{name:`union`,raw:`'startsWith' | 'contains' | 'none' | 'async'`,elements:[{name:`literal`,value:`'startsWith'`},{name:`literal`,value:`'contains'`},{name:`literal`,value:`'none'`},{name:`literal`,value:`'async'`}]},{name:`undefined`}]},description:"How typing narrows `options`.",defaultValue:{value:`'contains'`,computed:!1}},placeholder:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Example input shown while empty. Never the only description.`},description:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Helper text under the label. Also the field's `accessibilityHint`."},required:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Must have a value to submit.`,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Not editable, not submitted, still readable and focusable.`,defaultValue:{value:`false`,computed:!1}},invalid:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Marks the field invalid.`,defaultValue:{value:`false`,computed:!1}},error:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:`Error message; implies invalid.`},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"For `async`: show the loading row and announce it. The consumer sets it around its request.",defaultValue:{value:`false`,computed:!1}},clearable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show a clear button when there is a value or text.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'fieldBorderFocus'
| 'fieldBorderInvalid'
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
| 'popupShadow'
| 'popupRadius'
| 'popupOffset'
| 'layer'
| 'fontFamily'
| 'fontSize'
| 'chipSize'
| 'lineHeight'
| 'disabledOpacity'
| 'enter'`,elements:[{name:`literal`,value:`'fieldBorderFocus'`},{name:`literal`,value:`'fieldBorderInvalid'`},{name:`literal`,value:`'fieldBorderWidth'`},{name:`literal`,value:`'fieldRadius'`},{name:`literal`,value:`'fieldPaddingInline'`},{name:`literal`,value:`'fieldPaddingBlock'`},{name:`literal`,value:`'fieldGap'`},{name:`literal`,value:`'chipRadius'`},{name:`literal`,value:`'chipPaddingInline'`},{name:`literal`,value:`'chipPaddingBlock'`},{name:`literal`,value:`'chipGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'helperSize'`},{name:`literal`,value:`'popupSurface'`},{name:`literal`,value:`'popupBorder'`},{name:`literal`,value:`'popupShadow'`},{name:`literal`,value:`'popupRadius'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'chipSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'enter'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ComboboxOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},onChange:{required:!1,tsType:{name:`union`,raw:`((value: ComboboxValue) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`)."},onInputChange:{required:!1,tsType:{name:`union`,raw:`((value: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on every keystroke with the input text. The hook for `async` filtering."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the list opens or closes.`}}}})))()}var Oe,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{De(),re(),Oe=[{value:`alex`,label:`Alex Kim`,description:`Design`},{value:`sam`,label:`Sam Patel`,description:`Engineering`},{value:`jo`,label:`Jo Rivera`,description:`Engineering`},{value:`lee`,label:`Lee Chen`,description:`Product`}],C={title:`Combobox/React Native`,component:y,decorators:[ne()],args:{label:`Assignee`,name:`assignee`,options:Oe,filter:`contains`,multiple:!1,allowCustom:!1,required:!1,disabled:!1,invalid:!1,loading:!1,clearable:!0}},w={},T={args:{filter:`startsWith`}},E={args:{filter:`contains`}},D={args:{filter:`none`}},O={args:{filter:`async`,loading:!1}},k={args:{label:`Reviewers`,name:`reviewers`,multiple:!0,defaultValue:[`sam`,`jo`]}},A={args:{label:`Tags`,name:`tags`,allowCustom:!0,options:[{value:`bug`,label:`Bug`},{value:`feature`,label:`Feature`}]}},j={args:{options:[{group:`Design`,options:[{value:`alex`,label:`Alex Kim`}]},{group:`Engineering`,options:[{value:`sam`,label:`Sam Patel`},{value:`jo`,label:`Jo Rivera`}]},{group:`Product`,options:[{value:`lee`,label:`Lee Chen`}]}]}},M={args:{filter:`async`,loading:!0,options:[]}},N={args:{options:[]}},P={args:{defaultValue:`sam`,clearable:!1}},F={args:{required:!0}},I={args:{disabled:!0,defaultValue:`sam`}},L={args:{invalid:!0}},R={args:{error:`Choose an assignee.`}},z={args:{description:`Searches everyone in the workspace.`}},B={args:{options:Oe}},V=[`Default`,`FilterStartsWith`,`FilterContains`,`FilterNone`,`FilterAsync`,`Multiple`,`AllowCustom`,`Grouped`,`Loading`,`Empty`,`ClearableFalse`,`Required`,`Disabled`,`Invalid`,`WithError`,`WithDescription`,`Keyboard`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'startsWith'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'contains'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'none'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    loading: false
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Reviewers',
    name: 'reviewers',
    multiple: true,
    defaultValue: ['sam', 'jo']
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Tags',
    name: 'tags',
    allowCustom: true,
    options: [{
      value: 'bug',
      label: 'Bug'
    }, {
      value: 'feature',
      label: 'Feature'
    }]
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    options: [{
      group: 'Design',
      options: [{
        value: 'alex',
        label: 'Alex Kim'
      }]
    }, {
      group: 'Engineering',
      options: [{
        value: 'sam',
        label: 'Sam Patel'
      }, {
        value: 'jo',
        label: 'Jo Rivera'
      }]
    }, {
      group: 'Product',
      options: [{
        value: 'lee',
        label: 'Lee Chen'
      }]
    }]
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'async',
    loading: true,
    options: []
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    options: []
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'sam',
    clearable: false
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'sam'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose an assignee.'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Searches everyone in the workspace.'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    options: OPTIONS
  }
}`,...B.parameters?.docs?.source},description:{story:"At least three focusable rows once opened, for the axe gate and manual keyboard\r\nchecks on react-native-web. Combobox has no `open`/`defaultOpen` prop (typing or\r\nfocusing the field opens it, matching the field's own behavior) — see the\r\ngeneration gap notes for why this story cannot render pre-opened like Menu's or\r\nDialog's `open: true` stories do.",...B.parameters?.docs?.description}}}})))()}H();export{A as AllowCustom,P as ClearableFalse,w as Default,I as Disabled,N as Empty,O as FilterAsync,E as FilterContains,D as FilterNone,T as FilterStartsWith,j as Grouped,L as Invalid,B as Keyboard,M as Loading,k as Multiple,F as Required,z as WithDescription,R as WithError,V as __namedExportsOrder,C as default};