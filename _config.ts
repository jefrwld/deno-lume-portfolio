import lume from "https://deno.land/x/lume/mod.ts";

import prism from "https://deno.land/x/lume/plugins/prism.ts";
import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";

const site = lume();
site.use(picture(/* Options */));
site.use(transformImages());
site.copy("/styles.css");
site.copy("/prism.css");


site.use(prism());

export default site;

