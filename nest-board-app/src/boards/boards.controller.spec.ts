import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import exp from 'constants';
import { BoardStatus } from './board-status.enum';
import { Board } from './board.entity';
import { BoardRepository } from './board.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

describe('BoardsController', () => {
  let controller: BoardsController;

  const mockBoards = [{
    id: 1,
    title: "제목1",
    description: "내용1",
    status: BoardStatus.PUBLIC
  }];

  const mockService = {
    createBoard: jest.fn().mockImplementation(dto => Promise.resolve({
      id: Date.now(),
      title: dto.title,
      description: dto.description,
      status: BoardStatus.PUBLIC
    }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [BoardsService]
    }).overrideProvider(BoardsService).useValue(mockService).compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createBoard test', async () => {
    const dto = {
      title: "제목1",
      description: "내용1"
    };

    expect(await controller.createBoard(dto)).toEqual({
      id: expect.any(Number),
      title: dto.title,
      description: dto.description,
      status: BoardStatus.PUBLIC
    });

    expect(mockService.createBoard).toHaveBeenCalledWith(dto);
  });

});
