#make clean html
make PELICANOPTS="-t /Users/trigrou/dev/BT3-Flat"  clean html
rsync -avh --exclude=.git --exclude=pbr  --link-dest=./demo/ ./demo/ output/demo
rsync -avh --exclude=.git  o--link-dest=./media/ ./media/  output/media
rsync -avh CNAME output/
ghp-import output
git push git@github.com:cedricpinson/cedricpinson.github.io.git gh-pages:master
