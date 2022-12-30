function Theme(props) {
  let colorSet = [
    {color: "white"},
    {color: "cornflowerblue"},
    {color: "indianred"},
    {color: "darkseagreen"},
    {color: "darksalmon"},
    {color: "violet"}
];
  
  return (
    <Page>
      <Section
        title={<Text bold>Theme Settings</Text>}>
        <ColorSelect settingsKey="Theme"
          colors={colorSet}
        />
      <Text>The <Text bold>white</Text> option turns back the original <Text bold>multicolor</Text> theme.</Text>
      </Section>
    </Page>
  );
}

registerSettingsPage(Theme);
