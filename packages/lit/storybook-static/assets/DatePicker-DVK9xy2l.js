import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as p,u as m,v as h,w as g}from"./if-defined-CARySXJh.js";import{t as _}from"./query-BHY-nhsh.js";import{t as ee}from"./Icon-BHsrajXm.js";import{t as te}from"./Text-BrJPDVza.js";import{t as ne}from"./Button-CG4k9eqY.js";import{n as v,t as re}from"./class-map-C-hUkrHk.js";import{r as ie,t as ae}from"./live-DYI4u8lm.js";import{t as oe}from"./Popover-DY5oJ08g.js";import{t as se}from"./Select-CR8lS8kO.js";function y(e){let[t,n,r]=e.split(`-`).map(Number);return{y:t,m:n-1,d:r}}function b(e,t,n){let r=new Date(Date.UTC(e,t,n));return`${String(r.getUTCFullYear()).padStart(4,`0`)}-${String(r.getUTCMonth()+1).padStart(2,`0`)}-${String(r.getUTCDate()).padStart(2,`0`)}`}function x(e,t){let{y:n,m:r,d:i}=y(e);return b(n,r,i+t)}function S(e,t){let{y:n,m:r,d:i}=y(e),a=new Date(Date.UTC(n,r+t,1)),o=new Date(Date.UTC(a.getUTCFullYear(),a.getUTCMonth()+1,0)).getUTCDate();return b(a.getUTCFullYear(),a.getUTCMonth(),Math.min(i,o))}function ce(e,t,n){let r=new Date(Date.UTC(e,t+1,0)).getUTCDate();return b(e,t,Math.min(n,r))}function C(){let e=new Date;return b(e.getFullYear(),e.getMonth(),e.getDate())}function w(e){let{y:t,m:n,d:r}=y(e);return new Date(Date.UTC(t,n,r)).getUTCDay()}function T(e){let{y:t,m:n,d:r}=y(e);return new Date(Date.UTC(t,n,r))}function le(e){let t=T(e);t.setUTCDate(t.getUTCDate()+3-(t.getUTCDay()+6)%7);let n=Date.UTC(t.getUTCFullYear(),0,1);return Math.floor((t.getTime()-n)/864e5/7)+1}function ue(e){if(e)try{return Intl.getCanonicalLocales(e)[0]}catch{return}}function E(e){try{let t=new Intl.Locale(e??new Intl.DateTimeFormat().resolvedOptions().locale),n=t.getWeekInfo?.()??t.weekInfo;if(n?.firstDay)return n.firstDay%7}catch{}return 0}function D(e,t){return new Intl.DateTimeFormat(e,{month:`long`,timeZone:`UTC`}).format(new Date(Date.UTC(2020,t,1)))}function O(e,t,n){return new Intl.DateTimeFormat(e,{weekday:n,timeZone:`UTC`}).format(new Date(Date.UTC(2023,0,1+t)))}function k(e,t){return new Intl.DateTimeFormat(t,Q).format(T(e))}function de(e,t){return new Intl.DateTimeFormat(t,{dateStyle:`full`,timeZone:`UTC`}).format(T(e))}function A(e){return new Intl.DateTimeFormat(e,Q).formatToParts(new Date(Date.UTC(2030,0,5)))}function j(e){let t={day:`DD`,month:`MM`,year:`YYYY`};return A(e).map(e=>t[e.type]??e.value).join(``)}function M(e,t){let n=A(t).map(e=>e.type).filter(e=>e===`day`||e===`month`||e===`year`),r=e.trim(),i=r.split(/[^0-9]+/).filter(Boolean);if(i.length===1&&/^[0-9]{8}$/.test(r)){let e=0;i=n.map(t=>{let n=t===`year`?4:2,i=r.slice(e,e+n);return e+=n,i})}if(i.length!==3||n.length!==3)return null;let a={};for(let e=0;e<3;e+=1){let t=i[e],r=n[e];if(r===`year`&&t.length!==4)return null;a[r]=Number(t)}let{day:o,month:s,year:c}=a;if(!o||!s||!c||s<1||s>12)return null;let l=b(c,s-1,o);return y(l).m===s-1?l:null}function fe(e,t,n){let r=b(e,t,1),i=(w(r)-n+7)%7,a=x(r,-i),o=new Date(Date.UTC(e,t+1,0)).getUTCDate(),s=Math.ceil((i+o)/7)*7,c=[];for(let e=0;e<s;e+=7)c.push(Array.from({length:7},(t,n)=>x(a,e+n)));return c}function pe(e,t){return e===null||t===null||typeof e==`string`||typeof t==`string`?e===t:e.start===t.start&&e.end===t.end}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt,it,at,ot,st,ct,lt,ut,dt,J,ft,pt,mt,ht,gt,_t,vt,yt,Y,bt,xt,St,X,Ct,Z,wt,Tt,Et,Dt,Ot,Q,kt,At;function $(){return($=e((()=>{s(),n(),u(),p(),ae(),re(),r(),te(),ee(),ne(),se(),oe(),J={borderInvalid:`--ds-date-picker-border-invalid`,borderWidth:`--ds-date-picker-border-width`,radius:`--ds-date-picker-radius`,paddingInline:`--ds-date-picker-padding-inline`,paddingBlock:`--ds-date-picker-padding-block`,fontSize:`--ds-date-picker-font-size`,calendarInset:`--ds-date-picker-calendar-inset`,calendarGap:`--ds-date-picker-calendar-gap`,headerGap:`--ds-date-picker-header-gap`,footerGap:`--ds-date-picker-footer-gap`,dayGap:`--ds-date-picker-day-gap`,dayRadius:`--ds-date-picker-day-radius`,dayHover:`--ds-date-picker-day-hover`,weekdaySize:`--ds-date-picker-weekday-size`,weekdayWeight:`--ds-date-picker-weekday-weight`,weekNumberSize:`--ds-date-picker-week-number-size`,monthTitleSize:`--ds-date-picker-month-title-size`,monthTitleWeight:`--ds-date-picker-month-title-weight`,partGap:`--ds-date-picker-part-gap`,fieldGap:`--ds-date-picker-field-gap`,dayFontSize:`--ds-date-picker-day-font-size`,fontFamily:`--ds-date-picker-font-family`,lineHeight:`--ds-date-picker-line-height`,labelWeight:`--ds-date-picker-label-weight`,helperSize:`--ds-date-picker-helper-size`,disabledOpacity:`--ds-date-picker-disabled-opacity`,transition:`--ds-date-picker-transition`},ft=`Choose date`,pt=`Choose dates`,mt=`Previous month`,ht=`Next month`,gt=`Month`,_t=`Year`,vt=`Today`,yt=`Clear`,Y=`Week`,bt=(e,t,n)=>`${e}, ${t} ${n}`,xt=`selected`,St=`today`,X=`Start date`,Ct=`End date`,Z=e=>`${e} is required.`,wt=(e,t)=>`${e} must be a valid date (${t}).`,Tt=(e,t)=>`${e} must be on or after ${t}.`,Et=(e,t)=>`${e} must be on or before ${t}.`,Dt=`End date must be on or after the start date.`,Ot=` (required)`,Q={year:`numeric`,month:`2-digit`,day:`2-digit`,timeZone:`UTC`},kt=class extends HTMLElement{source=null;get name(){return this.source?`${this.source.name()}-end`:``}set name(e){}get label(){return this.source?.label()??``}set label(e){}get required(){return this.source?.required()??!1}set required(e){}get disabled(){return this.source?.disabled()??!1}set disabled(e){}get currentValue(){return this.source?.value()??null}validationMessage=``;connectedCallback(){this.hidden=!0,this.setAttribute(`data-ds-field`,``)}focus(){this.source?.focus()}checkValidity(){return!0}},customElements.get(`ds-date-picker-end-field`)||customElements.define(`ds-date-picker-end-field`,kt),new class extends d{static[class extends h{static{({e:[P,F,I,L,R,z,B,V,H,U,W,G,K,q,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt,it,at,ot,st,ct,lt,ut,dt],c:[At,N]}=c(this,[o(`ds-date-picker`)],[[m(),1,`label`],[m(),1,`name`],[m({attribute:!1}),1,`value`],[m({attribute:!1}),1,`defaultValue`],[m({attribute:!1}),1,`open`],[m({type:Boolean,reflect:!0}),1,`range`],[m(),1,`min`],[m(),1,`max`],[m({attribute:!1}),1,`isDateDisabled`],[m({reflect:!0}),1,`locale`],[m({type:Boolean,reflect:!0,attribute:`show-week-numbers`}),1,`showWeekNumbers`],[m(),1,`placeholder`],[m(),1,`description`],[m({type:Boolean,reflect:!0}),1,`required`],[m({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[m({type:String,reflect:!0}),1,`size`],[m({type:Boolean,reflect:!0}),1,`disabled`],[m(),1,`error`],[m({attribute:!1}),1,`overrides`],[a(),1,`internalStart`],[a(),1,`internalEnd`],[a(),1,`draftStart`],[a(),1,`textStart`],[a(),1,`textEnd`],[a(),1,`internalOpen`],[a(),1,`viewYear`],[a(),1,`viewMonth`],[a(),1,`focusedDate`],[a(),1,`formDisabled`],[_(`#input`),1,`startInputEl`],[_(`#input-end`),1,`endInputEl`],[_(`#popover`),1,`popoverEl`],[_(`#calendar-button`),1,`calendarButtonEl`]],0,void 0,h))}#e=P(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(F(this),I(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(L(this),R(this));get value(){return this.#n}set value(e){this.#n=e}#r=(z(this),B(this));get defaultValue(){return this.#r}set defaultValue(e){this.#r=e}#i=(V(this),H(this));get open(){return this.#i}set open(e){this.#i=e}#a=(U(this),W(this,!1));get range(){return this.#a}set range(e){this.#a=e}#o=(G(this),K(this));get min(){return this.#o}set min(e){this.#o=e}#s=(q(this),me(this));get max(){return this.#s}set max(e){this.#s=e}#c=(he(this),ge(this));get isDateDisabled(){return this.#c}set isDateDisabled(e){this.#c=e}#l=(_e(this),ve(this));get locale(){return this.#l}set locale(e){this.#l=e}#u=(ye(this),be(this,!1));get showWeekNumbers(){return this.#u}set showWeekNumbers(e){this.#u=e}#d=(xe(this),Se(this));get placeholder(){return this.#d}set placeholder(e){this.#d=e}#f=(Ce(this),we(this));get description(){return this.#f}set description(e){this.#f=e}#p=(Te(this),Ee(this,!1));get required(){return this.#p}set required(e){this.#p=e}#m=(De(this),Oe(this,!1));get hideLabel(){return this.#m}set hideLabel(e){this.#m=e}#h=(ke(this),Ae(this,`md`));get size(){return this.#h}set size(e){this.#h=e}#g=(je(this),Me(this,!1));get disabled(){return this.#g}set disabled(e){this.#g=e}#_=(Ne(this),Pe(this));get error(){return this.#_}set error(e){this.#_=e}#v=(Fe(this),Ie(this));get overrides(){return this.#v}set overrides(e){this.#v=e}#y=(Le(this),Re(this));get internalStart(){return this.#y}set internalStart(e){this.#y=e}#b=(ze(this),Be(this));get internalEnd(){return this.#b}set internalEnd(e){this.#b=e}#x=(Ve(this),He(this));get draftStart(){return this.#x}set draftStart(e){this.#x=e}#S=(Ue(this),We(this,``));get textStart(){return this.#S}set textStart(e){this.#S=e}#C=(Ge(this),Ke(this,``));get textEnd(){return this.#C}set textEnd(e){this.#C=e}#w=(qe(this),Je(this,!1));get internalOpen(){return this.#w}set internalOpen(e){this.#w=e}#T=(Ye(this),Xe(this,new Date().getFullYear()));get viewYear(){return this.#T}set viewYear(e){this.#T=e}#E=(Ze(this),Qe(this,new Date().getMonth()));get viewMonth(){return this.#E}set viewMonth(e){this.#E=e}#D=($e(this),et(this,``));get focusedDate(){return this.#D}set focusedDate(e){this.#D=e}#O=(tt(this),nt(this,!1));get formDisabled(){return this.#O}set formDisabled(e){this.#O=e}#k=(rt(this),it(this));get startInputEl(){return this.#k}set startInputEl(e){this.#k=e}#A=(at(this),ot(this));get endInputEl(){return this.#A}set endInputEl(e){this.#A=e}#j=(st(this),ct(this));get popoverEl(){return this.#j}set popoverEl(e){this.#j=e}#M=(lt(this),ut(this));get calendarButtonEl(){return this.#M}set calendarButtonEl(e){this.#M=e}openSeen=(dt(this),!1);focusOnOpen=!1;lastEmittedValue=null;internals;endField;constructor(){super(),this.internals=this.attachInternals(),this.endField=document.createElement(`ds-date-picker-end-field`),this.endField.source={name:()=>this.name,label:()=>this.label,required:()=>this.required,disabled:()=>this.isDisabled,value:()=>{let e=this.committedValue;return typeof e==`object`&&e?e.end:null},focus:()=>this.endInputEl?.focus()}}get currentValue(){let e=this.committedValue;return e===null?null:typeof e==`string`?e:e.start}get form(){return this.internals.form}get validity(){return this.syncInternals(),this.internals.validity}get validationMessage(){return this.syncInternals(),this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.seedFromValue(this.value??this.defaultValue),this.lastEmittedValue=this.committedValue}formStateRestoreCallback(e){if(this.value===void 0){if(typeof e==`string`&&!this.range)this.seedFromValue(e);else if(e instanceof FormData&&this.range){let t=e.get(this.name),n=e.get(`${this.name}-end`);typeof t==`string`&&typeof n==`string`&&this.seedFromValue({start:t,end:n})}this.lastEmittedValue=this.committedValue}}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`DatePicker`),this.setAttribute(`data-ds-field`,``)}get isDisabled(){return this.disabled||this.formDisabled}get isOpen(){return this.open??this.internalOpen}get resolvedLocale(){return ue(this.locale)??ue(document.documentElement.lang)}get committedValue(){return this.range?this.internalStart!==void 0&&this.internalEnd!==void 0?{start:this.internalStart,end:this.internalEnd}:null:this.internalStart??null}willUpdate(e){if(!this.hasUpdated){this.seedFromValue(this.value??this.defaultValue),this.lastEmittedValue=this.committedValue;let e=y(this.internalStart??C());this.viewYear=e.y,this.viewMonth=e.m}else if((e.has(`value`)||e.has(`range`))&&this.value!==void 0)this.seedFromValue(this.value),this.lastEmittedValue=this.committedValue;else if(e.has(`locale`)){let e=this.resolvedLocale;this.textStart=this.internalStart?k(this.internalStart,e):this.textStart,this.textEnd=this.internalEnd?k(this.internalEnd,e):this.textEnd}e.has(`overrides`)&&this.applyOverrides();let t=this.isOpen;t!==this.openSeen&&(this.openSeen=t,t?(this.moveViewTo(this.focusedDate||this.internalStart||C()),this.focusOnOpen=!0):(this.draftStart=void 0,this.focusedDate=``,this.focusOnOpen=!1))}firstUpdated(){}updated(){this.syncInternals(),this.syncEndField(),this.focusOnOpen&&(this.focusOnOpen=!1,this.focusDayAfterOpen())}render(){let e=this.isDisabled,t=!!this.error,n=[this.description?`description`:``,t?`error`:``].filter(Boolean).join(` `)||void 0,r=this.placeholder||j(this.resolvedLocale);return g`
      <div class=${v({group:!0,disabled:e})}>
        <label
          id="label"
          class=${v({"visually-hidden":this.hideLabel})}
          part="label"
          data-part="label"
          for="input"
          >${this.label}${this.required?Ot:i}</label
        >
        ${this.description?g`<ds-text id="description" part="description" data-part="description" element="p" size="sm" tone="muted"
              >${this.description}</ds-text
            >`:i}
        <div class=${v({invalid:t})} part="field" data-part="field">
          ${this.renderInput(`start`,r,n,t,e)}
          ${this.range?g`<span class="separator" aria-hidden="true">–</span>
                ${this.renderInput(`end`,r,n,t,e)}`:i}
          <ds-popover
            id="popover"
            part="popover"
            data-part="popover"
            placement="bottom-start"
            no-dismiss
            .open=${this.isOpen}
            .overrides=${{inset:this.overrides?.calendarInset??`layout.inset.md`}}
            @open-change=${this.handlePopoverOpenChange}
          >
            <ds-button
              slot="trigger"
              id="calendar-button"
              part="calendarButton"
              data-part="calendarButton"
              variant="ghost"
              size=${this.size}
              icon-only
              label=${this.range?pt:ft}
              ?disabled=${e}
              @press=${this.stopPress}
            >
              <ds-icon slot="leading-icon" name="calendar"></ds-icon>
            </ds-button>
            ${this.renderCalendar(e)}
          </ds-popover>
        </div>
        ${t?g`<p id="error" role="alert" part="errorMessage" data-part="errorMessage">${this.error}</p>`:i}
      </div>
    `}renderInput(e,t,n,r,a){let o=e===`start`;return g`
      ${this.range?g`<span id=${o?`start-label`:`end-label`} class="visually-hidden"
            >${o?X:Ct}</span
          >`:i}
      <input
        id=${o?`input`:`input-end`}
        part="input"
        data-part="input"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder=${t}
        .value=${ie(o?this.textStart:this.textEnd)}
        aria-labelledby=${f(this.range?o?`label start-label`:`label end-label`:void 0)}
        aria-describedby=${f(n)}
        aria-invalid=${f(r?`true`:void 0)}
        aria-required=${f(this.required?`true`:void 0)}
        aria-disabled=${f(a?`true`:void 0)}
        ?readonly=${a}
        @input=${t=>this.handleTextInput(t,e)}
        @keydown=${t=>this.handleInputKeydown(t,e)}
      />
    `}renderCalendar(e){let t=this.resolvedLocale,n=E(t),r=C(),a=D(t,this.viewMonth),o=String(this.viewYear),s={fontSize:this.overrides?.monthTitleSize??`font.size.md`,fontWeight:this.overrides?.monthTitleWeight??`font.weight.semibold`},c=Array.from({length:7},(e,t)=>(n+t)%7);return g`
      <div class="calendar" @keydown=${this.handleCalendarKeydown}>
        <div part="header" data-part="header">
          <ds-button
            part="prevMonthButton"
            data-part="prevMonthButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${mt}
            ?disabled=${e}
            @press=${this.handlePrevMonthPress}
          >
            <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
          </ds-button>
          <ds-select
            part="monthSelect"
            data-part="monthSelect"
            label=${gt}
            name="month"
            hide-label
            size="sm"
            .options=${this.monthOptions(t)}
            .value=${String(this.viewMonth)}
            .overrides=${s}
            ?disabled=${e}
            @change=${this.handleMonthChange}
          ></ds-select>
          <ds-select
            part="yearSelect"
            data-part="yearSelect"
            label=${_t}
            name="year"
            hide-label
            size="sm"
            .options=${this.yearOptions}
            .value=${o}
            .overrides=${s}
            ?disabled=${e}
            @change=${this.handleYearChange}
          ></ds-select>
          <ds-button
            part="nextMonthButton"
            data-part="nextMonthButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${ht}
            ?disabled=${e}
            @press=${this.handleNextMonthPress}
          >
            <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
          </ds-button>
        </div>
        <span id="grid-label" class="visually-hidden">${bt(this.label,a,o)}</span>
        <table role="grid" part="grid" data-part="grid" aria-labelledby="grid-label" @keydown=${this.handleGridKeydown}>
          <thead>
            <tr>
              ${this.showWeekNumbers?g`<th scope="col" abbr=${Y}><span class="visually-hidden">${Y}</span></th>`:i}
              ${c.map(e=>g`<th scope="col" part="weekdayHeader" data-part="weekdayHeader" abbr=${O(t,e,`long`)}>
                    ${O(t,e,`short`)}
                  </th>`)}
            </tr>
          </thead>
          <tbody>
            ${fe(this.viewYear,this.viewMonth,n).map(e=>g`
                <tr>
                  ${this.showWeekNumbers?g`<th scope="row" part="weekNumber" data-part="weekNumber">${le(e[0])}</th>`:i}
                  ${e.map(e=>this.renderDay(e,r,t))}
                </tr>
              `)}
          </tbody>
        </table>
        <div part="footer" data-part="footer">
          <ds-button
            part="todayButton"
            data-part="todayButton"
            variant="ghost"
            size="sm"
            label=${vt}
            ?disabled=${e||this.isDayDisabled(r)}
            @press=${this.handleTodayPress}
          ></ds-button>
          <ds-button
            part="clearButton"
            data-part="clearButton"
            variant="ghost"
            size="sm"
            label=${yt}
            ?disabled=${e}
            @press=${this.handleClearPress}
          ></ds-button>
        </div>
      </div>
    `}renderDay(e,t,n){let{m:r,d:i}=y(e),a=e===t,o=this.isDayDisabled(e),s=this.draftStart,c=s??this.internalStart,l=s===void 0&&this.range?this.internalEnd:void 0,u=e===c||l!==void 0&&e===l,d=c!==void 0&&l!==void 0&&e>c&&e<l,p=u||d,m=this.focusedDate||this.defaultFocusDate,h=[de(e,n),a?St:``,p?xt:``].filter(Boolean).join(`, `);return g`
      <td role="gridcell" aria-selected=${p?`true`:`false`}>
        <button
          type="button"
          part="day"
          data-part="day"
          class=${v({outside:r!==this.viewMonth,selected:u,"in-range":d})}
          data-iso=${e}
          tabindex=${e===m?0:-1}
          aria-current=${f(a?`date`:void 0)}
          aria-disabled=${f(o?`true`:void 0)}
          aria-label=${h}
          @click=${()=>this.selectDay(e)}
          @focus=${()=>{this.focusedDate!==e&&(this.focusedDate=e)}}
        >
          ${i}
        </button>
      </td>
    `}get defaultFocusDate(){let e=e=>{if(!e)return!1;let{y:t,m:n}=y(e);return t===this.viewYear&&n===this.viewMonth},t=this.draftStart??this.internalStart;if(e(t))return t;let n=C();return e(n)?n:b(this.viewYear,this.viewMonth,1)}monthOptions(e){return Array.from({length:12},(t,n)=>({value:String(n),label:D(e,n)}))}get yearOptions(){let e=new Date().getFullYear(),t=Math.min(this.min?y(this.min).y:e-100,this.viewYear),n=Math.max(this.max?y(this.max).y:e+10,this.viewYear),r=[];for(let e=t;e<=n;e+=1)r.push({value:String(e),label:String(e)});return r}seedFromValue(e){if(this.range){let t=e!==void 0&&typeof e==`object`?e:void 0;this.internalStart=t?.start||void 0,this.internalEnd=t?.end||void 0}else this.internalStart=typeof e==`string`&&e!==``?e:void 0,this.internalEnd=void 0;let t=this.resolvedLocale;this.textStart=this.internalStart?k(this.internalStart,t):``,this.textEnd=this.internalEnd?k(this.internalEnd,t):``}isDayDisabled(e){return!!(this.min&&e<this.min||this.max&&e>this.max||this.isDateDisabled?.(e))}commit(e,t,n){if(this.internalStart=e,this.internalEnd=this.range?t:void 0,this.range&&e!==void 0!=(t!==void 0))return;let r=this.committedValue;(n||!pe(r,this.lastEmittedValue))&&(this.lastEmittedValue=r,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:r??void 0},bubbles:!0,composed:!0})),this.value!==void 0&&(this.seedFromValue(this.value),this.lastEmittedValue=this.committedValue))}selectDay(e){if(this.isDisabled||this.isDayDisabled(e))return;this.focusedDate=e;let t=this.resolvedLocale;if(!this.range){this.textStart=k(e,t),this.commit(e,void 0,!0),this.closeCalendar();return}let n=this.draftStart;if(n===void 0||e<n){this.draftStart=e;return}this.draftStart=void 0,this.textStart=k(n,t),this.textEnd=k(e,t),this.commit(n,e,!0),this.closeCalendar()}handleTextInput(e,t){if(this.isDisabled)return;let n=e.currentTarget.value;t===`start`?this.textStart=n:this.textEnd=n;let r;if(n.trim()!==``){let e=M(n,this.resolvedLocale);if(e===null)return;r=e,this.isOpen&&this.moveViewTo(r)}t===`start`?this.commit(r,this.internalEnd,!1):this.commit(this.internalStart,r,!1)}requestOpen(e){this.isOpen===e||e&&this.isDisabled||(this.open===void 0&&(this.internalOpen=e),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e},bubbles:!0,composed:!0})))}closeCalendar(){this.requestOpen(!1),this.updateComplete.then(()=>{this.isOpen||this.calendarButtonEl?.focus()})}async focusDayAfterOpen(){await this.popoverEl?.updateComplete,await new Promise(e=>setTimeout(e)),this.isOpen&&(this.dispatchEvent(new Event(`scroll`)),this.dayButton(this.focusedDate||this.defaultFocusDate)?.focus())}handlePopoverOpenChange=e=>{e.stopPropagation(),e.target===e.currentTarget&&this.requestOpen(e.detail.open)};stopPress=e=>{e.stopPropagation()};handleInputKeydown(e,t){if(e.key!==`ArrowDown`||this.isDisabled)return;e.preventDefault();let n=(t===`end`?this.internalEnd:void 0)??this.internalStart??C();if(this.isOpen){this.moveFocusTo(this.draftStart??n);return}this.focusedDate=n,this.requestOpen(!0)}dayButton(e){return this.renderRoot.querySelector(`[data-part="day"][data-iso="${e}"]`)}moveViewTo(e){let{y:t,m:n}=y(e);this.viewYear=t,this.viewMonth=n,this.focusedDate=e}async moveFocusTo(e){this.moveViewTo(e),await this.updateComplete,this.dayButton(e)?.focus()}stepEnabled(e,t){let n=e;for(let r=0;r<3660;r+=1){if(n=x(n,t),this.min&&n<this.min||this.max&&n>this.max)return e;if(!this.isDayDisabled(n))return n}return e}handleGridKeydown=e=>{if(!(e.target instanceof HTMLElement)||e.target.dataset.part!==`day`||e.altKey||e.ctrlKey||e.metaKey)return;let t=this.focusedDate||this.defaultFocusDate,n=E(this.resolvedLocale),r;switch(e.key){case`ArrowRight`:r=this.stepEnabled(t,1);break;case`ArrowLeft`:r=this.stepEnabled(t,-1);break;case`ArrowDown`:r=this.stepEnabled(t,7);break;case`ArrowUp`:r=this.stepEnabled(t,-7);break;case`Home`:r=x(t,-((w(t)-n+7)%7));break;case`End`:r=x(t,6-(w(t)-n+7)%7);break;case`PageUp`:r=S(t,e.shiftKey?-12:-1);break;case`PageDown`:r=S(t,e.shiftKey?12:1);break;case`Enter`:case` `:e.preventDefault(),this.selectDay(t);return;default:return}e.preventDefault(),this.moveFocusTo(r)};handleCalendarKeydown=e=>{if(e.key!==`Tab`||e.defaultPrevented||e.composedPath().some(e=>e instanceof HTMLElement&&e.tagName===`DS-SELECT`))return;let t=this.renderRoot,n=Array.from(t.querySelectorAll(`[data-part="prevMonthButton"], [data-part="monthSelect"], [data-part="yearSelect"], [data-part="nextMonthButton"], [data-part="day"][tabindex="0"], [data-part="todayButton"], [data-part="clearButton"]`)).filter(e=>!e.hasAttribute(`disabled`)),r=n[0],i=n[n.length-1];if(!r||!i)return;let a=t.activeElement;e.shiftKey&&a===r?(e.preventDefault(),i.focus()):!e.shiftKey&&a===i&&(e.preventDefault(),r.focus())};handlePrevMonthPress=e=>{e.stopPropagation(),this.shiftView(-1)};handleNextMonthPress=e=>{e.stopPropagation(),this.shiftView(1)};shiftView(e){let t=this.focusedDate||b(this.viewYear,this.viewMonth,1);this.moveViewTo(S(t,e))}handleMonthChange=e=>{e.stopPropagation();let t=this.focusedDate||b(this.viewYear,this.viewMonth,1);this.moveViewTo(ce(this.viewYear,Number(e.detail.value),y(t).d))};handleYearChange=e=>{e.stopPropagation();let t=this.focusedDate||b(this.viewYear,this.viewMonth,1);this.moveViewTo(ce(Number(e.detail.value),this.viewMonth,y(t).d))};handleTodayPress=e=>{e.stopPropagation();let t=C();this.isDayDisabled(t)||(this.moveViewTo(t),this.selectDay(t))};handleClearPress=e=>{e.stopPropagation(),!this.isDisabled&&(this.draftStart=void 0,this.textStart=``,this.textEnd=``,this.commit(void 0,void 0,!0))};syncEndField(){let e=this.range&&this.name!==``;e&&this.endField.parentElement!==this?this.append(this.endField):!e&&this.endField.parentElement===this&&this.endField.remove()}syncInternals(){let e=this.committedValue;if(this.isDisabled||e===null)this.internals.setFormValue(null);else if(typeof e==`string`)this.internals.setFormValue(e);else{let t=new FormData;t.append(this.name,e.start),t.append(`${this.name}-end`,e.end),this.internals.setFormValue(t)}if(this.isDisabled){this.internals.setValidity({});return}let t=this.startInputEl??void 0,n=this.label,r=this.resolvedLocale,i=this.range?[this.textStart,this.textEnd]:[this.textStart],a=e=>e.trim()===``,o=e=>!a(e)&&M(e,r)===null,s=this.internalStart,c=this.range?this.internalEnd:s,l=s!==void 0&&c!==void 0;this.error?this.internals.setValidity({customError:!0},this.error,t):this.required&&i.every(a)?this.internals.setValidity({valueMissing:!0},Z(n),t):i.some(o)?this.internals.setValidity({badInput:!0},wt(n,j(r)),t):this.required&&!l?this.internals.setValidity({valueMissing:!0},Z(n),t):l&&this.min&&(s<this.min||c<this.min)?this.internals.setValidity({rangeUnderflow:!0},Tt(n,k(this.min,r)),t):l&&this.max&&(s>this.max||c>this.max)?this.internals.setValidity({rangeOverflow:!0},Et(n,k(this.max,r)),t):this.range&&l&&c<s?this.internals.setValidity({customError:!0},Dt,t):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(J)){let t=this.overrides?.[e],n=J[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}}];formAssociated=!0;shadowRootOptions={...h.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-date-picker-border-invalid: var(--color-border-danger);
      --ds-date-picker-border-width: var(--border-width-thin);
      --ds-date-picker-radius: var(--radius-md);
      --ds-date-picker-padding-inline: var(--space-md);
      --ds-date-picker-padding-block: var(--space-sm);
      --ds-date-picker-font-size: var(--font-size-md);
      --ds-date-picker-calendar-inset: var(--layout-inset-md);
      --ds-date-picker-calendar-gap: var(--layout-gap-normal);
      --ds-date-picker-header-gap: var(--layout-gap-tight);
      --ds-date-picker-footer-gap: var(--layout-gap-tight);
      --ds-date-picker-day-gap: var(--space-0);
      --ds-date-picker-day-radius: var(--radius-md);
      --ds-date-picker-day-hover: var(--color-action-ghost-background-hover);
      --ds-date-picker-weekday-size: var(--font-size-xs);
      --ds-date-picker-weekday-weight: var(--font-weight-medium);
      --ds-date-picker-week-number-size: var(--font-size-xs);
      --ds-date-picker-month-title-size: var(--font-size-md);
      --ds-date-picker-month-title-weight: var(--font-weight-semibold);
      --ds-date-picker-part-gap: var(--space-1);
      --ds-date-picker-field-gap: var(--space-2);
      --ds-date-picker-day-font-size: var(--font-size-sm);
      --ds-date-picker-font-family: var(--font-family-body);
      --ds-date-picker-line-height: var(--font-line-height-normal);
      --ds-date-picker-label-weight: var(--font-weight-medium);
      --ds-date-picker-helper-size: var(--font-size-sm);
      --ds-date-picker-disabled-opacity: var(--opacity-disabled);
      --ds-date-picker-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock / fontSize by size */
    :host([size='sm']) {
      --ds-date-picker-padding-inline: var(--space-2);
      --ds-date-picker-padding-block: var(--space-1);
      --ds-date-picker-font-size: var(--font-size-sm);
    }

    /* partGap: between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-date-picker-part-gap);
      position: relative;
      font-family: var(--ds-date-picker-font-family);
      line-height: var(--ds-date-picker-line-height);
    }

    /* disabledOpacity: the whole field group dims */
    .group.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* labelWeight, fontSize on the label part */
    [data-part='label'] {
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-font-size);
      font-weight: var(--ds-date-picker-label-weight);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    /* background / foreground / border (locked); minTarget, minTargetSm (locked); fieldGap */
    [data-part='field'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-date-picker-field-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-date-picker-padding-block);
      padding-inline: var(--ds-date-picker-padding-inline);
      border: var(--ds-date-picker-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-date-picker-radius);
      background: var(--color-background);
      color: var(--color-foreground);
    }
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--size-target-min);
    }

    /* borderFocus / focusRing / focusRingWidth (locked): the ring follows focus in the typed input(s) */
    [data-part='field']:has([data-part='input']:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--ds-date-picker-border-width));
    }

    /* borderInvalid */
    [data-part='field'].invalid {
      border-color: var(--ds-date-picker-border-invalid);
    }

    /* fontSize; placeholder (locked) */
    [data-part='input'] {
      flex: 1 1 8ch;
      min-inline-size: 8ch;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      color: inherit;
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-font-size);
      line-height: var(--ds-date-picker-line-height);
    }
    [data-part='input']::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }
    .group.disabled [data-part='input'] {
      cursor: not-allowed;
    }

    /* rangeSeparatorColor (locked) */
    .separator {
      color: var(--color-foreground-muted);
    }

    /* errorText (locked), helperSize */
    [data-part='errorMessage'] {
      margin: 0;
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-helper-size);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground-danger);
    }

    /* calendarGap: between header, grid and footer */
    .calendar {
      display: flex;
      flex-direction: column;
      gap: var(--ds-date-picker-calendar-gap);
      font-family: var(--ds-date-picker-font-family);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    /* headerGap */
    [data-part='header'] {
      display: flex;
      align-items: center;
      gap: var(--ds-date-picker-header-gap);
    }

    /* footerGap */
    [data-part='footer'] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ds-date-picker-footer-gap);
    }

    [data-part='monthSelect'],
    [data-part='yearSelect'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    /* dayGap: cells touch so a range reads as one bar */
    [data-part='grid'] {
      border-collapse: separate;
      border-spacing: var(--ds-date-picker-day-gap);
    }
    [data-part='grid'] td,
    [data-part='grid'] th {
      padding: 0;
    }

    /* weekdayColor (locked), weekdaySize, weekdayWeight */
    [data-part='grid'] thead th {
      font-size: var(--ds-date-picker-weekday-size);
      font-weight: var(--ds-date-picker-weekday-weight);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    /* weekNumberSize, in weekdayColor at the regular weight */
    [data-part='weekNumber'] {
      font-size: var(--ds-date-picker-week-number-size);
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    /* daySize, dayTodayBorderWidth (locked); dayRadius, dayFontSize; transition */
    [data-part='day'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--size-target-comfortable);
      block-size: var(--size-target-comfortable);
      margin: 0;
      padding: 0;
      border: var(--border-width-focus) solid transparent;
      border-radius: var(--ds-date-picker-day-radius);
      background: transparent;
      color: var(--color-foreground);
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-day-font-size);
      cursor: pointer;
      transition:
        background-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        color var(--ds-date-picker-transition) var(--motion-easing-standard),
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    /* dayHover */
    [data-part='day']:hover:not([aria-disabled='true']) {
      background: var(--ds-date-picker-day-hover);
    }

    /* dayOutsideMonthColor (locked) */
    [data-part='day'].outside {
      color: var(--color-foreground-muted);
    }

    /* dayTodayBorder (locked): a ring, distinct in shape from the selected fill */
    [data-part='day'][aria-current='date'] {
      border-color: var(--color-control-selected-background);
    }

    /* dayInRangeBackground (locked) */
    [data-part='day'].in-range {
      background: var(--color-background-strong);
      border-radius: 0;
    }

    /* daySelectedBackground / daySelectedForeground (locked) */
    [data-part='day'].selected,
    [data-part='day'].selected:hover {
      background: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    /* focusRing / focusRingWidth (locked): replaces the today ring while the day has focus */
    [data-part='day']:focus-visible {
      outline: none;
      border-color: var(--color-border-focus);
    }

    [data-part='day'][aria-disabled='true'] {
      opacity: var(--ds-date-picker-disabled-opacity);
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='day'] {
        transition: none;
      }
    }
  `;constructor(){super(At),N()}}})))()}export{$ as t};