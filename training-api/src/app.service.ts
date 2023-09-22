import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IExercise } from './interfaces/exercise.interface';
import { firstValueFrom } from 'rxjs';

export const fetchData = async (url, options) => {
  const res = await fetch(url, options);
  const data = await res.json();

  return data;
};

@Injectable()
export class AppService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @InjectModel('Exercise') private readonly exerciseModel: Model<IExercise>
  ) { }

  onModuleInit() {
    const cleardb = async () => {
      await this.exerciseModel.deleteMany({}).exec();
    };
    const seedAlgo = async () => {
      const data =  await fetchData('https://exercisedb.p.rapidapi.com/exercises', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
        },
      });

      //get all users which are trainers
      const trainers = await firstValueFrom(
        this.userServiceClient.send('user_search_by_params', {
          isTrainer: true,
        }),
      );

      // for each trainer add exercises to each of his traineeIds
      for (let i = 0; i < trainers.length; i++) {
        const trainer = trainers[i];
        const trainees = trainer.traineeIds;

        for (let j = 0; j < trainees.length; j++) {
          const traineeId = trainees[j];

     // get 5 random unique exercise from mock data without faker
     const exercises = data?.sort(() => Math.random() - Math.random()).slice(0, 5) || [];


     // for each trainer and trainee create 5 exercises
     if(exercises.length > 0) {
       for (let k = 0; k < 5; k++) {
         await this.exerciseModel.create({
           user_id: traineeId,
           trainer_id: trainer.id,
           content: exercises[k],
         });
       }

     }

   }
      }
    };

 
    this.exerciseModel.countDocuments({})
      .then(async (count: number) => {
        //console.log(' count is ' + count + '', await this.exerciseModel.find({}).exec());
        //if (count < 1) {
          await cleardb();
          await seedAlgo();
        //}
      })
      .catch((err: any) => {
        console.log(err);
      });
  };
}
