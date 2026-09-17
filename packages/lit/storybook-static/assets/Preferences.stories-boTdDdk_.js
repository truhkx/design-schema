import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{n as r}from"./iframe-DJFLK4ZL.js";function i(){return n`
    <ds-landmark role="main">
      <ds-stack gap="6" align="stretch">
        <ds-stack gap="2">
          <ds-breadcrumb .items=${a}></ds-breadcrumb>
          <ds-heading level="1">Notifications</ds-heading>
          <ds-text tone="muted">Choose what we send you and how often.</ds-text>
        </ds-stack>

        <ds-alert tone="info" live="off" heading="Applies to every device">
          <ds-text>These preferences follow your account, not this browser.</ds-text>
        </ds-alert>

        <ds-form name="preferences" label="Notification preferences">
          <ds-radio-group
            name="digest"
            label="Email digest"
            description="A single email that collects the activity you missed."
            .options=${o}
            default-value="weekly"
            required
          ></ds-radio-group>

          <ds-stack gap="0">
            <ds-checkbox
              name="mentions"
              label="Mentions and replies"
              description="When someone mentions you or replies to your comment."
              default-checked
            ></ds-checkbox>
            <ds-checkbox
              name="product"
              label="Product updates"
              description="About one email a month."
            ></ds-checkbox>
          </ds-stack>

          <ds-switch
            name="push"
            label="Push notifications"
            description="Delivered to this device right away."
            default-checked
          ></ds-switch>

          <ds-meter
            label="Attachment storage used"
            value="82"
            value-text="8.2 GB of 10 GB"
            tone="warning"
          ></ds-meter>

          <ds-disclosure summary="Advanced options" keep-mounted>
            <ds-checkbox
              name="quiet-hours"
              label="Pause notifications overnight"
              description="Nothing is sent between 22:00 and 07:00 in your time zone."
            ></ds-checkbox>
          </ds-disclosure>

          <ds-stack direction="horizontal" gap="2" align="center" wrap>
            <ds-button type="submit" label="Save"></ds-button>
            <ds-button variant="secondary" label="Cancel"></ds-button>
          </ds-stack>
        </ds-form>
      </ds-stack>
    </ds-landmark>
  `}var a,o;function s(){return(s=e((()=>{t(),r(),a=[{label:`Settings`,href:`#settings`},{label:`Notifications`}],o=[{value:`daily`,label:`Daily`,description:`One summary every morning`},{value:`weekly`,label:`Weekly`,description:`A summary every Monday`},{value:`never`,label:`Never`,description:`Only the alerts you turn on below`}]})))()}var c,l,u,d;function f(){return(f=e((()=>{t(),s(),c={title:`Demo/Preferences/Lit`,parameters:{actions:{handles:[`submit`,`invalid`,`press`,`change`,`toggle`,`navigate`,`dismiss`]},layout:`centered`},render:()=>n`<div style="inline-size: min(100%, 32rem)">${i()}</div>`},l={},u={render:()=>n`
    <div
      data-mode="dark"
      style="inline-size: min(100%, 32rem); padding: var(--space-6); background: var(--color-background)"
    >
      ${i()}
    </div>
  `},d=[`Default`,`DarkMode`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div
      data-mode="dark"
      style="inline-size: min(100%, 32rem); padding: var(--space-6); background: var(--color-background)"
    >
      \${renderPreferences()}
    </div>
  \`
}`,...u.parameters?.docs?.source}}}})))()}f();export{u as DarkMode,l as Default,d as __namedExportsOrder,c as default};