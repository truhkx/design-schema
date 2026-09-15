import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as ee,y as d}from"./decorators-BlUBDG4K.js";import{t as f}from"./query-BHY-nhsh.js";import{a as te,i as ne,r as p,t as re}from"./if-defined-BfpvQ5_i.js";import{t as ie}from"./Icon-CGupucWg.js";import{n as m,t as ae}from"./class-map-ByT5L8jj.js";import{t as oe}from"./Button-TSn-G4Vm.js";import{t as se}from"./Text-Dgpz9DWN.js";import{r as ce,t as le}from"./live-DoUijhZq.js";import{t as ue}from"./Popover-CSjz9iBj.js";import{t as de}from"./Select-h5GtQbtr.js";function h(e){let[t,n,r]=e.split(`-`).map(Number);return{y:t,m:n-1,d:r}}function g(e,t,n){let r=new Date(Date.UTC(e,t,n));return`${String(r.getUTCFullYear()).padStart(4,`0`)}-${String(r.getUTCMonth()+1).padStart(2,`0`)}-${String(r.getUTCDate()).padStart(2,`0`)}`}function _(e,t){let{y:n,m:r,d:i}=h(e);return g(n,r,i+t)}function v(e,t){let{y:n,m:r,d:i}=h(e),a=new Date(Date.UTC(n,r+t,1)),o=new Date(Date.UTC(a.getUTCFullYear(),a.getUTCMonth()+1,0)).getUTCDate();return g(a.getUTCFullYear(),a.getUTCMonth(),Math.min(i,o))}function y(e,t){return v(e,t*12)}function b(e,t,n){let r=new Date(Date.UTC(e,t+1,0)).getUTCDate();return g(e,t,Math.min(n,r))}function x(){let e=new Date;return`${String(e.getFullYear()).padStart(4,`0`)}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function S(e){let{y:t,m:n,d:r}=h(e);return new Date(Date.UTC(t,n,r)).getUTCDay()}function fe(e){let{y:t,m:n,d:r}=h(e),i=new Date(Date.UTC(t,n,r)),a=(i.getUTCDay()+6)%7;i.setUTCDate(i.getUTCDate()-a+3);let o=new Date(Date.UTC(i.getUTCFullYear(),0,4)),s=(o.getUTCDay()+6)%7;return o.setUTCDate(o.getUTCDate()-s+3),1+Math.round((i.getTime()-o.getTime())/6048e5)}function C(e){try{let t=new Intl.Locale(e??navigator.language),n=t.getWeekInfo?.()??t.weekInfo;if(n?.firstDay)return n.firstDay%7}catch{}return 0}function w(e,t){return new Intl.DateTimeFormat(e,{month:`long`,timeZone:`UTC`}).format(new Date(Date.UTC(2020,t,1)))}function pe(e,t){return new Intl.DateTimeFormat(e,{weekday:`short`,timeZone:`UTC`}).format(new Date(Date.UTC(2023,0,1+t)))}function me(e,t){return new Intl.DateTimeFormat(e,{weekday:`long`,timeZone:`UTC`}).format(new Date(Date.UTC(2023,0,1+t)))}function T(e,t){let{y:n,m:r,d:i}=h(e);return new Intl.DateTimeFormat(t,{year:`numeric`,month:`2-digit`,day:`2-digit`,timeZone:`UTC`}).format(new Date(Date.UTC(n,r,i)))}function he(e,t){let{y:n,m:r,d:i}=h(e);return new Intl.DateTimeFormat(t,{year:`numeric`,month:`long`,day:`numeric`,timeZone:`UTC`}).format(new Date(Date.UTC(n,r,i)))}function ge(e){let t=new Intl.DateTimeFormat(e,{year:`numeric`,month:`2-digit`,day:`2-digit`,timeZone:`UTC`}).formatToParts(new Date(Date.UTC(2030,0,5))),n=[];for(let e of t)(e.type===`day`||e.type===`month`||e.type===`year`)&&n.push(e.type);return n}function E(e){let t=new Intl.DateTimeFormat(e,{year:`numeric`,month:`2-digit`,day:`2-digit`,timeZone:`UTC`}).formatToParts(new Date(Date.UTC(2030,0,5))),n={day:`DD`,month:`MM`,year:`YYYY`};return t.map(e=>n[e.type]??e.value).join(``)}function D(e,t){let n=e.trim().split(/[^0-9]+/).filter(Boolean);if(n.length!==3)return null;let r=ge(t),i={};for(let e=0;e<3;e+=1){let t=n[e];if(r[e]===`year`&&t.length!==4)return null;i[r[e]]=Number(t)}let{day:a,month:o,year:s}=i;if(!a||!o||!s||o<1||o>12)return null;let c=g(s,o-1,a);return h(c).m===o-1?c:null}function _e(e,t,n){let r=g(e,t,1),i=(S(r)-n+7)%7,a=_(r,-i),o=new Date(Date.UTC(e,t+1,0)).getUTCDate(),s=Math.ceil((i+o)/7)*7,c=[];for(let e=0;e<s;e+=7)c.push(Array.from({length:7},(t,n)=>_(a,e+n)));return c}var O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt,it,at,ot,st,X,ct,lt,ut,dt,ft,pt,mt,ht,gt,_t,vt,yt,bt,Z,xt,Q,St,Ct,wt,Tt,Et;function $(){return($=e((()=>{i(),a(),u(),re(),le(),ae(),te(),se(),ie(),oe(),de(),ue(),X={borderFocus:`--ds-date-picker-border-focus`,borderInvalid:`--ds-date-picker-border-invalid`,borderWidth:`--ds-date-picker-border-width`,radius:`--ds-date-picker-radius`,paddingInline:`--ds-date-picker-padding-inline`,paddingBlock:`--ds-date-picker-padding-block`,paddingBlockSm:`--ds-date-picker-padding-block-sm`,paddingInlineSm:`--ds-date-picker-padding-inline-sm`,calendarInset:`--ds-date-picker-calendar-inset`,calendarGap:`--ds-date-picker-calendar-gap`,daySize:`--ds-date-picker-day-size`,dayGap:`--ds-date-picker-day-gap`,dayRadius:`--ds-date-picker-day-radius`,dayHover:`--ds-date-picker-day-hover`,dayTodayBorderWidth:`--ds-date-picker-day-today-border-width`,weekdaySize:`--ds-date-picker-weekday-size`,weekdayWeight:`--ds-date-picker-weekday-weight`,monthTitleSize:`--ds-date-picker-month-title-size`,monthTitleWeight:`--ds-date-picker-month-title-weight`,partGap:`--ds-date-picker-part-gap`,fieldGap:`--ds-date-picker-field-gap`,dayFontSize:`--ds-date-picker-day-font-size`,fontFamily:`--ds-date-picker-font-family`,lineHeight:`--ds-date-picker-line-height`,labelWeight:`--ds-date-picker-label-weight`,helperSize:`--ds-date-picker-helper-size`,minTargetSm:`--ds-date-picker-min-target-sm`,disabledOpacity:`--ds-date-picker-disabled-opacity`,transition:`--ds-date-picker-transition`},ct=`Choose date`,lt=`Choose dates`,ut=`Previous month`,dt=`Next month`,ft=`Month`,pt=`Year`,mt=`Today`,ht=`Clear`,gt=`Week`,_t=(e,t,n)=>`${e}, ${t} ${n}`,vt=`selected`,yt=`today`,bt=`Start date`,Z=`End date`,xt=e=>`${e} is required.`,Q=(e,t)=>`${e} must be a valid date (${t}).`,St=(e,t)=>`${e} must be on or after ${t}.`,Ct=(e,t)=>`${e} must be on or before ${t}.`,wt=`End date must be after the start date.`,Tt=` (required)`,new class extends r{static[class extends s{static{({e:[A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,rt,it,at,ot,st,O],c:[Et,k]}=ee(this,[l(`ds-date-picker`)],[[n(),1,`label`],[n(),1,`name`],[n({attribute:!1}),1,`value`],[n({attribute:!1}),1,`defaultValue`],[n({type:Boolean,reflect:!0}),1,`open`],[n({type:Boolean,reflect:!0}),1,`range`],[n(),1,`min`],[n(),1,`max`],[n({attribute:!1}),1,`isDateDisabled`],[n({reflect:!0}),1,`locale`],[n({type:Boolean,reflect:!0,attribute:`show-week-numbers`}),1,`showWeekNumbers`],[n(),1,`placeholder`],[n(),1,`description`],[n({type:Boolean,reflect:!0}),1,`required`],[n({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[n({reflect:!0}),1,`size`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0}),1,`invalid`],[n(),4,`error`],[n({attribute:!1}),1,`overrides`],[c(),1,`internalStart`],[c(),1,`internalEnd`],[c(),1,`textStart`],[c(),1,`textEnd`],[c(),1,`internalOpen`],[c(),1,`viewYear`],[c(),1,`viewMonth`],[c(),1,`focusedDate`],[c(),1,`formDisabled`],[f(`#input`),1,`startInputEl`],[f(`#input-end`),1,`endInputEl`],[f(`#popover`),1,`popoverEl`],[f(`#calendar-button`),1,`calendarButtonEl`]],0,void 0,s))}#e=(O(this),A(this));get label(){return this.#e}set label(e){this.#e=e}#t=(j(this),M(this));get name(){return this.#t}set name(e){this.#t=e}#n=(N(this),P(this));get value(){return this.#n}set value(e){this.#n=e}#r=(F(this),I(this));get defaultValue(){return this.#r}set defaultValue(e){this.#r=e}#i=(L(this),R(this));get open(){return this.#i}set open(e){this.#i=e}#a=(z(this),B(this,!1));get range(){return this.#a}set range(e){this.#a=e}#o=(V(this),H(this));get min(){return this.#o}set min(e){this.#o=e}#s=(U(this),W(this));get max(){return this.#s}set max(e){this.#s=e}#c=(G(this),K(this));get isDateDisabled(){return this.#c}set isDateDisabled(e){this.#c=e}#l=(q(this),J(this));get locale(){return this.#l}set locale(e){this.#l=e}#u=(Y(this),ve(this,!1));get showWeekNumbers(){return this.#u}set showWeekNumbers(e){this.#u=e}#d=(ye(this),be(this));get placeholder(){return this.#d}set placeholder(e){this.#d=e}#f=(xe(this),Se(this));get description(){return this.#f}set description(e){this.#f=e}#p=(Ce(this),we(this,!1));get required(){return this.#p}set required(e){this.#p=e}#m=(Te(this),Ee(this,!1));get hideLabel(){return this.#m}set hideLabel(e){this.#m=e}#h=(De(this),Oe(this,`md`));get size(){return this.#h}set size(e){this.#h=e}#g=(ke(this),Ae(this,!1));get disabled(){return this.#g}set disabled(e){this.#g=e}#_=(je(this),Me(this,!1));get invalid(){return this.#_}set invalid(e){this.#_=e}errorValue=void Ne(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#v=Pe(this);get overrides(){return this.#v}set overrides(e){this.#v=e}#y=(Fe(this),Ie(this));get internalStart(){return this.#y}set internalStart(e){this.#y=e}#b=(Le(this),Re(this));get internalEnd(){return this.#b}set internalEnd(e){this.#b=e}#x=(ze(this),Be(this,``));get textStart(){return this.#x}set textStart(e){this.#x=e}#S=(Ve(this),He(this,``));get textEnd(){return this.#S}set textEnd(e){this.#S=e}#C=(Ue(this),We(this,!1));get internalOpen(){return this.#C}set internalOpen(e){this.#C=e}#w=(Ge(this),Ke(this,new Date().getFullYear()));get viewYear(){return this.#w}set viewYear(e){this.#w=e}#T=(qe(this),Je(this,new Date().getMonth()));get viewMonth(){return this.#T}set viewMonth(e){this.#T=e}#E=(Ye(this),Xe(this,``));get focusedDate(){return this.#E}set focusedDate(e){this.#E=e}#D=(Ze(this),Qe(this,!1));get formDisabled(){return this.#D}set formDisabled(e){this.#D=e}#O=($e(this),et(this));get startInputEl(){return this.#O}set startInputEl(e){this.#O=e}#k=(tt(this),nt(this));get endInputEl(){return this.#k}set endInputEl(e){this.#k=e}#A=(rt(this),it(this));get popoverEl(){return this.#A}set popoverEl(e){this.#A=e}#j=(at(this),ot(this));get calendarButtonEl(){return this.#j}set calendarButtonEl(e){this.#j=e}wasOpen=(st(this),!1);lastEmittedValue=null;internals;constructor(){super(),this.internals=this.attachInternals()}get isDisabled(){return this.disabled||this.formDisabled}get isOpen(){return this.open??this.internalOpen}setOpen(e){this.isOpen!==e&&(this.open===void 0?this.internalOpen=e:this.open=e,this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e},bubbles:!0,composed:!0})))}get currentValue(){return this.range?this.internalStart!==void 0&&this.internalEnd!==void 0?{start:this.internalStart,end:this.internalEnd}:null:this.internalStart??null}get form(){return this.internals.form}get validationMessage(){return this.internals.validationMessage}get monthOptions(){return Array.from({length:12},(e,t)=>({value:String(t),label:w(this.locale,t)}))}get yearRange(){let e=new Date().getFullYear();return[this.min?h(this.min).y:e-100,this.max?h(this.max).y:e+10]}get yearOptions(){let[e,t]=this.yearRange,n=[];for(let r=e;r<=t;r+=1)n.push({value:String(r),label:String(r)});return n}get weekdayLabels(){let e=C(this.locale);return Array.from({length:7},(t,n)=>{let r=(e+n)%7;return{short:pe(this.locale,r),full:me(this.locale,r)}})}get calendarWeeks(){return _e(this.viewYear,this.viewMonth,C(this.locale))}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`DatePicker`)}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.value=void 0,this.seedFromValue(this.defaultValue),this.lastEmittedValue=this.currentValue,this.open===void 0&&(this.internalOpen=!1)}formStateRestoreCallback(e){typeof e==`string`&&!this.range&&(this.internalStart=e,this.textStart=T(e,this.locale))}seedFromValue(e){if(this.range){let t=e&&typeof e==`object`?e:void 0;this.internalStart=t?.start,this.internalEnd=t?.end}else this.internalStart=typeof e==`string`?e:void 0,this.internalEnd=void 0;this.textStart=this.internalStart?T(this.internalStart,this.locale):``,this.textEnd=this.internalEnd?T(this.internalEnd,this.locale):``}willUpdate(e){if(this.hasUpdated)e.has(`value`)&&this.value!==void 0&&this.seedFromValue(this.value);else{this.seedFromValue(this.value??this.defaultValue),this.lastEmittedValue=this.currentValue;let e=this.internalStart??x();this.viewYear=h(e).y,this.viewMonth=h(e).m}e.has(`overrides`)&&this.applyOverrides()}updated(){this.syncInternals(),this.isOpen!==this.wasOpen&&(this.wasOpen=this.isOpen,this.isOpen?this.focusSelectedOrToday():this.focusedDate=``),this.warnInDev()}render(){let e=this.isDisabled,t=[this.description?`description`:``,this.error?`error-message`:``].filter(e=>e!==``).join(` `)||void 0,n=E(this.locale),r=this.placeholder||n,i=_t(this.label,w(this.locale,this.viewMonth),String(this.viewYear)),a=this.weekdayLabels;return d`
      <ds-text
        id="label"
        part="label"
        class=${m({label:!0,"visually-hidden":this.hideLabel})}
        element="p"
        weight="medium"
        >${this.label}${this.required?d`<span aria-hidden="true">${Tt}</span>`:o}</ds-text
      >
      ${this.description?d`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`:o}
      <div class=${m({field:!0,disabled:e})} part="field">
        ${this.range?d`<span id="start-label" class="visually-hidden">${bt}</span>`:o}
        <input
          id="input"
          part="input"
          class="input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          name=${this.name}
          placeholder=${r}
          .value=${ce(this.textStart)}
          aria-labelledby=${this.range?`label start-label`:`label`}
          aria-describedby=${p(t)}
          aria-invalid=${p(this.invalid?`true`:void 0)}
          aria-required=${p(this.required?`true`:void 0)}
          aria-disabled=${p(e?`true`:void 0)}
          ?readonly=${e}
          @input=${e=>this.handleTextInput(e,`start`)}
          @keydown=${e=>this.handleInputKeydown(e,`start`)}
        />
        ${this.range?d`
              <span class="separator" part="separator" aria-hidden="true">–</span>
              <span id="end-label" class="visually-hidden">${Z}</span>
              <input
                id="input-end"
                part="input"
                class="input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                name="${this.name}-end"
                placeholder=${r}
                .value=${ce(this.textEnd)}
                aria-labelledby="label end-label"
                aria-describedby=${p(t)}
                aria-invalid=${p(this.invalid?`true`:void 0)}
                aria-disabled=${p(e?`true`:void 0)}
                ?readonly=${e}
                @input=${e=>this.handleTextInput(e,`end`)}
                @keydown=${e=>this.handleInputKeydown(e,`end`)}
              />
            `:o}
        <ds-popover
          id="popover"
          part="popover"
          placement="bottom-start"
          no-dismiss
          .open=${this.isOpen}
          .overrides=${{inset:this.overrides?.calendarInset}}
          @open-change=${this.handlePopoverOpenChange}
        >
          <ds-button
            slot="trigger"
            id="calendar-button"
            part="calendarButton"
            variant="ghost"
            size=${this.size}
            icon-only
            label=${this.range?lt:ct}
            ?disabled=${e}
            @press=${e=>e.stopPropagation()}
          >
            <ds-icon slot="leading-icon" name="calendar"></ds-icon>
          </ds-button>
          <div class="calendar">
            <div class="header" part="header">
              <ds-button
                part="prevMonthButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${ut}
                ?disabled=${e}
                @press=${this.handlePrevMonthPress}
              >
                <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
              </ds-button>
              <ds-select
                part="monthSelect"
                class="month-select"
                label=${ft}
                name="month"
                .options=${this.monthOptions}
                .value=${String(this.viewMonth)}
                ?disabled=${e}
                @change=${this.handleMonthChange}
              ></ds-select>
              <ds-select
                part="yearSelect"
                class="year-select"
                label=${pt}
                name="year"
                .options=${this.yearOptions}
                .value=${String(this.viewYear)}
                ?disabled=${e}
                @change=${this.handleYearChange}
              ></ds-select>
              <ds-button
                part="nextMonthButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${dt}
                ?disabled=${e}
                @press=${this.handleNextMonthPress}
              >
                <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
              </ds-button>
            </div>
            <div id="grid-label" class="visually-hidden">${i}</div>
            <table role="grid" part="grid" class="grid" aria-labelledby="grid-label" @keydown=${this.handleGridKeydown}>
              <thead>
                <tr>
                  ${this.showWeekNumbers?d`<th class="weekday" scope="col">${gt}</th>`:o}
                  ${a.map(e=>d`<th class="weekday" part="weekdayHeader" scope="col" abbr=${e.full}>${e.short}</th>`)}
                </tr>
              </thead>
              <tbody>
                ${this.calendarWeeks.map(e=>d`
                    <tr>
                      ${this.showWeekNumbers?d`<td class="week-number">${fe(e[0])}</td>`:o}
                      ${e.map(e=>this.renderDay(e))}
                    </tr>
                  `)}
              </tbody>
            </table>
            <div class="footer" part="footer">
              <ds-button
                part="todayButton"
                variant="ghost"
                size="sm"
                label=${mt}
                ?disabled=${e}
                @press=${this.handleTodayPress}
              ></ds-button>
              <ds-button
                part="clearButton"
                variant="ghost"
                size="sm"
                label=${ht}
                ?disabled=${e}
                @press=${this.handleClearPress}
              ></ds-button>
            </div>
          </div>
        </ds-popover>
      </div>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error??``}</div>
    `}renderDay(e){let{m:t,d:n}=h(e),r=t===this.viewMonth,i=e===x(),a=this.isDayDisabled(e),s=e===this.internalStart||e===this.internalEnd,c=this.range&&this.internalStart!==void 0&&this.internalEnd!==void 0&&e>this.internalStart&&e<this.internalEnd,l=e===this.focusedDate?0:-1,u=he(e,this.locale);return i&&(u+=` ${yt}`),s&&(u+=` ${vt}`),d`
      <td role="gridcell">
        <button
          type="button"
          part="day"
          class=${m({day:!0,outside:!r,today:i,selected:s,"in-range":c,disabled:a})}
          data-iso=${e}
          tabindex=${l}
          aria-selected=${s?`true`:`false`}
          aria-current=${i?`date`:o}
          aria-disabled=${a?`true`:o}
          aria-label=${u}
          @click=${()=>this.handleDayClick(e)}
          @focus=${()=>{this.focusedDate!==e&&(this.focusedDate=e)}}
        >
          ${n}
        </button>
      </td>
    `}isDayDisabled(e){return!!(this.min&&e<this.min||this.max&&e>this.max||this.isDateDisabled?.(e))}nextEnabledDate(e,t){let n=e;for(let e=0;e<366;e+=1)if(n=_(n,t),!this.isDayDisabled(n))return n;return n}startOfWeek(e){let t=C(this.locale);return _(e,-((S(e)-t+7)%7))}endOfWeek(e){return _(this.startOfWeek(e),6)}moveViewTo(e){let{y:t,m:n}=h(e);this.viewYear=t,this.viewMonth=n,this.focusedDate=e}async moveFocusTo(e){this.moveViewTo(e),await this.updateComplete,this.renderRoot.querySelector(`button[data-iso="${e}"]`)?.focus()}handleGridKeydown=e=>{if(this.isDisabled)return;let t=this.focusedDate||x();switch(e.key){case`ArrowRight`:e.preventDefault(),this.moveFocusTo(this.nextEnabledDate(t,1));return;case`ArrowLeft`:e.preventDefault(),this.moveFocusTo(this.nextEnabledDate(t,-1));return;case`ArrowDown`:e.preventDefault(),this.moveFocusTo(this.nextEnabledDate(t,7));return;case`ArrowUp`:e.preventDefault(),this.moveFocusTo(this.nextEnabledDate(t,-7));return;case`Home`:e.preventDefault(),this.moveFocusTo(this.startOfWeek(t));return;case`End`:e.preventDefault(),this.moveFocusTo(this.endOfWeek(t));return;case`PageUp`:e.preventDefault(),this.moveFocusTo(e.shiftKey?y(t,-1):v(t,-1));return;case`PageDown`:e.preventDefault(),this.moveFocusTo(e.shiftKey?y(t,1):v(t,1));return;case`Enter`:case` `:e.preventDefault(),this.handleDayClick(t);return;default:return}};handleDayClick(e){if(this.isDisabled||this.isDayDisabled(e))return;if(this.focusedDate=e,!this.range){this.internalStart=e,this.textStart=T(e,this.locale),this.maybeEmitChange(),this.closeCalendar();return}let t=this.internalStart;t!==void 0&&this.internalEnd===void 0&&e>=t?(this.internalEnd=e,this.textEnd=T(e,this.locale),this.maybeEmitChange(),this.closeCalendar()):(this.internalStart=e,this.internalEnd=void 0,this.textStart=T(e,this.locale),this.textEnd=``,this.maybeEmitChange())}closeCalendar(){this.setOpen(!1),this.focusCalendarButton()}async focusCalendarButton(){await this.updateComplete,this.calendarButtonEl?.focus()}async focusSelectedOrToday(){let e=this.focusedDate===``?this.internalStart??this.internalEnd??x():this.focusedDate;this.moveViewTo(e),await this.updateComplete,await this.popoverEl?.updateComplete,this.renderRoot.querySelector(`button[data-iso="${e}"]`)?.focus()}handlePrevMonthPress=e=>{e.stopPropagation(),this.shiftView(-1)};handleNextMonthPress=e=>{e.stopPropagation(),this.shiftView(1)};shiftView(e){let t=v(g(this.viewYear,this.viewMonth,1),e);this.viewYear=h(t).y,this.viewMonth=h(t).m}handleMonthChange=e=>{e.stopPropagation();let t=Number(e.detail.value),n=this.focusedDate||g(this.viewYear,this.viewMonth,1),r=b(this.viewYear,t,h(n).d);this.moveViewTo(r)};handleYearChange=e=>{e.stopPropagation();let t=Number(e.detail.value),n=this.focusedDate||g(this.viewYear,this.viewMonth,1),r=b(t,this.viewMonth,h(n).d);this.moveViewTo(r)};handleTodayPress=e=>{e.stopPropagation(),!this.isDisabled&&this.handleDayClick(x())};handleClearPress=e=>{e.stopPropagation(),!this.isDisabled&&(this.internalStart=void 0,this.internalEnd=void 0,this.textStart=``,this.textEnd=``,this.maybeEmitChange(),this.moveViewTo(x()))};handleTextInput(e,t){let n=e.currentTarget.value;if(t===`start`?this.textStart=n:this.textEnd=n,n.trim()===``){t===`start`?this.internalStart=void 0:this.internalEnd=void 0,this.maybeEmitChange();return}let r=D(n,this.locale);r!==null&&(t===`start`?this.internalStart=r:this.internalEnd=r,this.isOpen&&this.moveViewTo(r),this.maybeEmitChange())}handleInputKeydown(e,t){if(!this.isDisabled&&e.key===`ArrowDown`){e.preventDefault();let n=(t===`start`?this.internalStart:this.internalEnd)??this.internalStart??x();this.moveViewTo(n),this.setOpen(!0)}}handlePopoverOpenChange=e=>{this.setOpen(e.detail.open)};valuesEqual(e,t){return e===t?!0:e===null||t===null?!1:typeof e==`string`||typeof t==`string`?e===t:e.start===t.start&&e.end===t.end}maybeEmitChange(){let e=this.currentValue;this.valuesEqual(e,this.lastEmittedValue)||(this.lastEmittedValue=e,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e??void 0},bubbles:!0,composed:!0})))}syncInternals(){let e=this.currentValue,t=this.isDisabled;if(this.range){if(t||e===null)this.internals.setFormValue(null);else{let t=e,n=new FormData;n.append(this.name,t.start),n.append(`${this.name}-end`,t.end),this.internals.setFormValue(n)}}else this.internals.setFormValue(t||e===null?null:e);if(t){this.internals.setValidity({});return}let n=this.startInputEl,r=E(this.locale),i=this.textStart.trim(),a=this.textEnd.trim();this.error?this.internals.setValidity({customError:!0},this.error,n):this.invalid?this.internals.setValidity({customError:!0},Q(this.label,r),n):this.required&&e===null?this.internals.setValidity({valueMissing:!0},xt(this.label),n):i!==``&&D(this.textStart,this.locale)===null||this.range&&a!==``&&D(this.textEnd,this.locale)===null?this.internals.setValidity({customError:!0},Q(this.label,r),n):this.min&&this.internalStart!==void 0&&this.internalStart<this.min?this.internals.setValidity({rangeUnderflow:!0},St(this.label,this.min),n):this.max&&((this.range?this.internalEnd:this.internalStart)??``)>this.max?this.internals.setValidity({rangeOverflow:!0},Ct(this.label,this.max),n):this.range&&this.internalStart!==void 0&&this.internalEnd!==void 0&&this.internalEnd<this.internalStart?this.internals.setValidity({customError:!0},wt,n):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(X)){let t=this.overrides?.[e],n=X[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,ne(t))}}warnInDev(){}}];formAssociated=!0;shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-date-picker-border-focus: var(--color-border-focus);
      --ds-date-picker-border-invalid: var(--color-border-danger);
      --ds-date-picker-border-width: var(--border-width-thin);
      --ds-date-picker-radius: var(--radius-md);
      --ds-date-picker-padding-inline: var(--space-md);
      --ds-date-picker-padding-block: var(--space-sm);
      --ds-date-picker-padding-inline-sm: var(--space-2);
      --ds-date-picker-padding-block-sm: var(--space-1);
      --ds-date-picker-min-target-sm: var(--size-target-min);
      --ds-date-picker-part-gap: var(--space-1);
      --ds-date-picker-field-gap: var(--space-2);
      --ds-date-picker-calendar-inset: var(--layout-inset-md);
      --ds-date-picker-calendar-gap: var(--layout-gap-normal);
      --ds-date-picker-day-size: var(--size-target-comfortable);
      --ds-date-picker-day-gap: var(--space-0);
      --ds-date-picker-day-radius: var(--radius-md);
      --ds-date-picker-day-hover: var(--color-action-ghost-background-hover);
      --ds-date-picker-day-today-border-width: var(--border-width-focus);
      --ds-date-picker-weekday-size: var(--font-size-xs);
      --ds-date-picker-weekday-weight: var(--font-weight-medium);
      --ds-date-picker-month-title-size: var(--font-size-md);
      --ds-date-picker-month-title-weight: var(--font-weight-semibold);
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

    .label {
      display: block;
      font-size: var(--font-size-md);
      font-weight: var(--ds-date-picker-label-weight);
      line-height: var(--ds-date-picker-line-height);
    }

    /* descriptionText: color.foreground.muted, locked (set on ds-text via tone="muted") */
    .description {
      margin-block-start: var(--ds-date-picker-part-gap);
    }

    /* background / foreground / border: color.background / color.foreground / color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-date-picker-field-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-date-picker-part-gap);
      padding-block: var(--ds-date-picker-padding-block);
      padding-inline: var(--ds-date-picker-padding-inline);
      border: var(--ds-date-picker-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-date-picker-radius);
      background: var(--color-background);
      font-family: var(--ds-date-picker-font-family);
      transition:
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        padding var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field,
      .day {
        transition: none;
      }
    }

    /*
     * focusRingWidth (locked) replaces borderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-within {
      border-color: var(--ds-date-picker-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-date-picker-padding-inline) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
      padding-block: calc(
        var(--ds-date-picker-padding-block) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
    }

    :host([invalid]) .field {
      border-color: var(--ds-date-picker-border-invalid);
    }
    :host([invalid]) .field:focus-within {
      border-color: var(--ds-date-picker-border-invalid);
    }

    .field.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
    }
    .field.disabled .input {
      cursor: not-allowed;
    }

    /* paddingBlockSm / paddingInlineSm / minTargetSm replace the md bindings at size sm */
    :host([size='sm']) .field {
      min-block-size: var(--ds-date-picker-min-target-sm);
      padding-block: var(--ds-date-picker-padding-block-sm);
      padding-inline: var(--ds-date-picker-padding-inline-sm);
    }

    :host([size='sm']) .field:focus-within {
      padding-inline: calc(
        var(--ds-date-picker-padding-inline-sm) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
      padding-block: calc(
        var(--ds-date-picker-padding-block-sm) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
    }

    /* placeholder: color.foreground.muted, locked */
    .input {
      flex: 1 1 8ch;
      min-inline-size: 8ch;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--font-size-md);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /* rangeSeparatorColor: color.foreground.muted, locked */
    .separator {
      color: var(--color-foreground-muted);
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

    .calendar {
      display: flex;
      flex-direction: column;
      gap: var(--ds-date-picker-calendar-gap);
      font-family: var(--ds-date-picker-font-family);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--layout-gap-tight);
    }

    .month-select,
    .year-select {
      flex: 1;
      min-inline-size: 0;
      font-size: var(--ds-date-picker-month-title-size);
      font-weight: var(--ds-date-picker-month-title-weight);
    }

    .grid {
      inline-size: 100%;
      border-collapse: separate;
      border-spacing: var(--ds-date-picker-day-gap);
    }

    .weekday {
      font-size: var(--ds-date-picker-weekday-size);
      font-weight: var(--ds-date-picker-weekday-weight);
      color: var(--color-foreground-muted);
      text-align: center;
      padding-block-end: var(--space-1);
    }

    .week-number {
      font-size: var(--ds-date-picker-weekday-size);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    .day {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--ds-date-picker-day-size);
      block-size: var(--ds-date-picker-day-size);
      border: none;
      border-radius: var(--ds-date-picker-day-radius);
      background: transparent;
      color: var(--color-foreground);
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-day-font-size);
      cursor: pointer;
      transition:
        background-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    .day:not(.disabled):hover {
      background: var(--ds-date-picker-day-hover);
    }

    .day:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* dayOutsideMonthColor: color.foreground.muted, locked */
    .day.outside {
      color: var(--color-foreground-muted);
    }

    /* dayTodayBorder: color.control.selectedBackground, locked */
    .day.today {
      border: var(--ds-date-picker-day-today-border-width) solid var(--color-control-selected-background);
    }

    /* dayInRangeBackground: color.background.strong, locked */
    .day.in-range {
      background: var(--color-background-strong);
      border-radius: 0;
    }

    /* daySelectedBackground / daySelectedForeground: color.control.selectedBackground / selectedForeground, locked */
    .day.selected {
      background: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    .day.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
      cursor: not-allowed;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--layout-gap-tight);
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-date-picker-helper-size);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-date-picker-part-gap);
    }
  `;constructor(){super(Et),k()}}})))()}export{$ as t};