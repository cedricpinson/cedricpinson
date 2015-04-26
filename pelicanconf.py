#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'cedric pinson'
AUTHORS = AUTHOR
SITENAME = u'Cedric Pinson'
SITEURL = 'http://cedricpinson.com'
DISQUS_SITENAME = 'cedricpinsoncom'

TAGLINE = 'Messing with code'

SOCIAL = (
    ('github', 'https://github.com/cedricpinson/'),
    ('twitter-square', 'https://twitter.com/trigrou'),
)

PATH = 'content'

TIMEZONE = 'Europe/Paris'

DEFAULT_LANG = u'en'

GOOGLE_ANALYTICS = 'UA-62298088-1'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None


# Do not publish articles set in the future
#WITH_FUTURE_DATES = False
TEMPLATE_PAGES = {
    'blog.html': 'blog.html',
    'about.html': 'about.html'
}

STATIC_PATHS = ['images', 'extra/CNAME']
EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'}}

# Feed generation is usually not desired when developing
FEED_RSS = 'feed/index.html'
FEED_ATOM = 'feed/atom/index.html'
FEED_ALL_RSS = False
FEED_ALL_ATOM = False
TRANSLATION_FEED_RSS = False
TRANSLATION_FEED_ATOM = False

# Blogroll
#LINKS = (('osgjs.org', 'http://osgjs.org/'),)

# Social widget
SOCIAL = (('github', 'https://github.com/cedricpinson/'),
          ('twitter-square', 'https://twitter.com/trigrou'),
          ('linkedin', 'https://fr.linkedin.com/in/cedricpinson'),
          ('envelope', 'mailto:trigrou@gmail.com')
          )


DEFAULT_PAGINATION = False
DIRECT_TEMPLATES = ('index', 'blog',)
#PAGINATED_DIRECT_TEMPLATES = ('blog',)

SITE_THUMBNAIL = 'https://dl.dropboxusercontent.com/u/299446/logo.png'
SITE_THUMBNAIL_TEXT = 'Cedric Pinson'

POST_LIMIT = 30
#===theme settings===========================

FAVICON = 'https://dl.dropboxusercontent.com/u/299446/logo.png'
ICON = 'https://dl.dropboxusercontent.com/u/299446/logo.png'
SHORTCUT_ICON = 'https://dl.dropboxusercontent.com/u/299446/logo.png'
# HEADER_IMAGE = 'Your local or remote URL'
# COPYRIGHT = '2015 &copy; All Rights Reserved.'
# Google fonts can be downloaded with
# https://neverpanic.de/downloads/code/2014-03-19-downloading-google-web-fonts-for-local-hosting-fetch.sh'
# Maybe you need to add missing mime types to your webserver configuration
# USER_FONT = '/theme/fonts/font.css'
# USER_BOOTSTRAP = '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4'
# USER_FONTAWESOME = '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0'
# USER_JQUERY = '//code.jquery.com/jquery-1.11.2.min.js'

# About ME
PERSONAL_PHOTO = "https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/2/000/0c1/007/254c58d.jpg"
PERSONAL_INFO = """Cedric Pinson (@trigrou) is the cofounder and CTO of Sketchfab, a platform for sharing 3D content online. A veteran of the game industry since 2001, he transitioned from a project leader in 3D client technology to launching his career as a freelance developer in 2008. Cedric’s personal and freelance projects quickly led him to become a pioneer in WebGL technology. He developed OSG.JS a framework implementing an OpenScenGraph-like toolbox to interact with WebGL via JavaScript. Using this technology, he focused on the creation of a real-time, online 3D viewer. Cedric’s innovation was quickly embraced by the 3D community and morphed into Sketchfab."""



# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
