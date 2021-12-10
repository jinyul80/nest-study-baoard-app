import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import exp from 'constants';
import { BoardStatus } from './board-status.enum';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

describe('BoardsController', () => {
  let controller: BoardsController;

  const mockBoards = [
    {
      id: 1,
      title: '제목1',
      description: '내용1',
      status: BoardStatus.PUBLIC,
    },
    {
      id: 2,
      title: '제목2',
      description: '내용2',
      status: BoardStatus.PUBLIC,
    },
  ];

  const mockService = {
    // morking 방법 1
    // 서비스 생성하면서 morking
    createBoard: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: Date.now(),
        title: dto.title,
        description: dto.description,
        status: BoardStatus.PUBLIC,
      }),
    ),
    deleteBoard: jest.fn().mockImplementation((id: number) => {
      const found = mockBoards.find((board) => board.id === id);

      if (!found) {
        throw new NotFoundException(`Can't find Board with id ${id}`);
      }
    }),
    getBoardById: jest.fn(),
    getAllBoards: jest.fn(),
    updateBoardStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [BoardsService],
    })
      .overrideProvider(BoardsService)
      .useValue(mockService)
      .compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createBoard test', async () => {
    const dto = {
      title: '제목1',
      description: '내용1',
    };

    expect(await controller.createBoard(dto)).toEqual({
      id: expect.any(Number),
      title: dto.title,
      description: dto.description,
      status: BoardStatus.PUBLIC,
    });

    expect(mockService.createBoard).toHaveBeenCalledWith(dto);
  });

  it('deleteBoard test', async () => {
    const id = 4;

    try {
      controller.deleteBoard(id);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }

    expect(mockService.deleteBoard).toHaveBeenCalledWith(id);
  });

  it('getAllBoards test', async () => {
    // morking 방법 2
    // mockBoards 객체를 리턴한다고 가정
    mockService.getAllBoards.mockResolvedValue(mockBoards);

    const result = await controller.getAllBoards();

    expect(mockService.getAllBoards).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBoards);
  });

  describe('getBoardById test', () => {
    it('게시물이 있는 경우', async () => {
      const id = 1;

      const mockBoard = mockBoards.find((board) => board.id === id);

      // morking 방법 2
      mockService.getBoardById.mockResolvedValue(mockBoard);

      const result = await controller.getBoardById(id);

      expect(mockService.getBoardById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBoard);
    });

    it('게시물이 없는 경우', async () => {
      const id = 100;

      // morking 방법 2
      mockService.getBoardById.mockRejectedValue(new NotFoundException());

      try {
        await controller.getBoardById(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
      expect(mockService.getBoardById).toHaveBeenCalledWith(id);
    });
  });

  it('updateBoardStatus test', async () => {
    const id = 1;

    // morking 방법 2
    // 메서드 재 형성
    mockService.updateBoardStatus.mockImplementation((id, status) => {
      const board = mockBoards.find((board) => board.id === id);
      board.status = status;

      return board;
    });

    const result = await controller.updateBoardStatus(id, BoardStatus.PRIVATE);

    expect(result.id).toEqual(id);
    expect(result.status).toEqual(BoardStatus.PRIVATE);

    expect(mockService.updateBoardStatus).toHaveBeenCalledWith(id, BoardStatus.PRIVATE);
  });
});
