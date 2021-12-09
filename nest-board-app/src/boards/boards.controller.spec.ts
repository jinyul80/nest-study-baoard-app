import { Test, TestingModule } from '@nestjs/testing';
import { Board } from './board.entity';
import { BoardRepository } from './board.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [BoardsService, BoardRepository]
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});
