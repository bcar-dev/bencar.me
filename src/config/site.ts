export const siteConfig = {
    name: 'Benjamin Carlier',
    description: 'Personal website of Benjamin Carlier.',
    url: 'https://bencar.me',
    author: {
        name: 'Benjamin Carlier',
        pseudonym: 'Ben',
        bio: 'Backend, data and AI.\nLong rides and bikepacking in between.',
        avatar: '/profile.jpg',
    },
    links: {
        github: 'https://github.com/bcar-dev',
        linkedin: 'https://www.linkedin.com/in/benjamin-carlier',
    },
    nav: [
        { title: 'Posts', href: '/posts' },
        { title: 'About', href: '/about' },
    ],
    pagination: {
        recentPostsCount: 10,
    },
    search: {
        occurrenceLimit: 100,
    },
};
