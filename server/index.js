import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectDb } from './config/mongo.js';
import { router_user } from './router/user.router.js';
import { router_product } from './router/product.router.js';
import { router_category } from './router/category.router.js';
import { router_cart } from './router/cart.router.js';
import { router_country } from './router/country.router.js';
import { router_useraddress } from './router/useraddress.router.js';
import { router_voucher } from './router/voucher.router.js';
import { router_statusorders } from './router/statusorders.router.js';
import { router_banner } from './router/banner.router.js';
import { router_orders } from './router/orders.router.js';
import { router_favorite } from './router/favorite.router.js';
import { router_reviews } from './router/reviews.router.js';
import { router_figures } from './router/figures.router.js';
import { router_useremails } from './router/useremails.router.js';
import { setCampaign } from './middleware/cron.js';
import { checkAndUpdateCoupon } from './controllers/coupon.controllers.js';
import { router_coupon } from './router/coupon.router.js';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import { userModel } from './models/user.model.js';
import { roleModel } from './models/role.model.js';
import { chatModel } from './models/chat.model.js';
import { newestMessageModel } from './models/newestMessage.model.js';
import { router_chat } from './router/chat.router.js';
config();
connectDb();
const port = process.env.PORT;
const app = express();
setCampaign('* * * * *', checkAndUpdateCoupon);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('joinChat', async (user) => {
    await userModel.findByIdAndUpdate(user._id, { socketId: socket.id });
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, content, sentBy } = data;

    if (!receiver) {
      const roleAdmin = await roleModel.findOne({ name: 'admin' });

      if (roleAdmin) {
        const admin = await userModel.aggregate([
          { $match: { role: roleAdmin._id, socketId: { $ne: null } } },
          { $sample: { size: 1 } },
        ]);

        if (admin.length > 0) {
          let existedChat = await chatModel.findOne({
            sender: sender?._id ? sender._id : sender,
            receiver: { $ne: null },
          });
          socket.emit('receiveMessage', { ...data });
          if (existedChat) {
            const admin = await userModel.findById(existedChat.receiver);
            const newMessage = new chatModel({
              sender: sender?._id ? sender._id : sender,
              receiver: existedChat.receiver,
              content: content,
              sentBy: sentBy,
            });
            await newMessage.save();
            io.to(admin.socketId).emit('receiveMessage', {
              ...data,
              refetch: true,
            });
          } else {
            const newMessage = new chatModel({
              sender: sender?._id ? sender._id : sender,
              receiver: admin[0]._id,
              content: content,
              sentBy: sentBy,
            });
            await newMessage.save();
            io.to(admin[0].socketId).emit('receiveMessage', {
              ...data,
              refetch: true,
            });

            existedChat = { receiver: admin[0]._id };
          }

          const existedMessage = await newestMessageModel.findOne({
            sender: sender?._id ? sender._id : sender,
            receiver: existedChat.receiver,
          });

          if (existedMessage) {
            await newestMessageModel.findByIdAndUpdate(
              existedMessage._id,
              {
                content: content,
                updated_at: Date.now(),
                lastSent: sender,
                isRead: false,
              },
              {
                new: true,
              }
            );
          } else {
            await newestMessageModel.create({
              sender: sender?._id ? sender._id : sender,
              receiver: existedChat.receiver,
              content: content,
              lastSent: sender?._id ? sender._id : sender,
              isRead: false,
              updated_at: Date.now(),
            });
          }
        } else {
          const user = await userModel.findById(
            sender?._id ? sender._id : sender
          );
          socket.emit('receiveMessage', { ...data });
          io.to(user.socketId).emit('receiveMessage', { ...data, error: true });
        }
      }
    } else {
      const newMessage = new chatModel({
        sender: sender?._id ? sender._id : sender,
        receiver: receiver,
        content: content,
        sentBy: sentBy,
      });
      await newMessage.save();

      const existedMessage = await newestMessageModel.findOne({
        receiver: receiver,
      });

      if (existedMessage) {
        await newestMessageModel.findByIdAndUpdate(
          existedMessage._id,
          {
            content: content,
            lastSent: receiver,
            updated_at: Date.now(),
            isRead: true,
          },
          {
            new: true,
          }
        );
      } else {
        await newestMessageModel.create({
          sender: sender?._id ? sender._id : sender,
          receiver: receiver,
          content: content,
          isRead: true,
          updated_at: Date.now(),
          lastSent: receiver,
        });
      }
      const user = await userModel.findById(sender?._id ? sender._id : sender);
      io.to(user.socketId).emit('receiveMessage', {
        ...data,
      });
      socket.emit('receiveMessage', { ...data });
    }
  });
  socket.on('endChat', async (data) => {
    const { sender } = data;
    const user = await userModel.findById(sender?._id ? sender._id : sender);
    io.to(user.socketId).emit('endChat', { ...data, endChat: true });
  });
  socket.on('disconnect', async () => {
    await userModel.findOneAndUpdate(
      { socketId: socket.id },
      { socketId: null }
    );
    console.log('Client disconnected');
  });
});

app.use(cors());
app.use('/public', express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(router_user);
app.use(router_product);
app.use(router_category);
app.use(router_cart);
app.use(router_country);
app.use(router_useraddress);
app.use(router_voucher);
app.use(router_statusorders);
app.use(router_banner);
app.use(router_orders);
app.use(router_favorite);
app.use(router_reviews);
app.use(router_figures);
app.use(router_useremails);
app.use(router_coupon);
app.use(router_chat);
server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
