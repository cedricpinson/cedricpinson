make clean html
rsync -avh --exclude=.git --exclude=pbr  --link-dest=./demo/ ./demo/ output/demo
rsync -avh --exclude=.git  --link-dest=./media/ ./media/  output/media
