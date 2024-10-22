---
title: "my blog"
---
Blog posts:

<ul>
  {% for page in collections.posts %}
    <li><a href="{{ page.url }}">{{ page.data.title }}</a></li>
  {% endfor %}
</ul>
