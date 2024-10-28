import lume from "lume/mod.ts";
import prism from "https://deno.land/x/lume/plugins/prism.ts";

const site = lume();
site.copy("/styles.css");
site.copy("/prism.css");

site.use(prism());
export default site;
