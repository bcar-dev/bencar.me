import type { Component } from 'vue';
// Real icons from the Lucide set (Feather's maintained successor), pulled in
// per-icon via unplugin-icons so only what we use is bundled. Add a new icon by
// importing it here and adding it to the map.
import Github from '~icons/bi/github';
import Linkedin from '~icons/bi/linkedin';
import Tags from '~icons/lucide/tags';
import Calendar from '~icons/lucide/calendar';
import ArrowRight from '~icons/lucide/arrow-right';
import Menu from '~icons/lucide/menu';
import X from '~icons/lucide/x';
import Search from '~icons/lucide/search';
import Sun from '~icons/lucide/sun';
import Moon from '~icons/lucide/moon';
import List from '~icons/lucide/list';

export const ICONS = {
    github: Github,
    linkedin: Linkedin,
    tags: Tags,
    calendar: Calendar,
    'arrow-right': ArrowRight,
    menu: Menu,
    x: X,
    search: Search,
    sun: Sun,
    moon: Moon,
    list: List,
} satisfies Record<string, Component>;

export type IconName = keyof typeof ICONS;
