import { CanActivate, NotFoundException } from '@nestjs/common';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/auth/user.entity';
import { Repository } from 'typeorm';
import { BoardStatus } from './board-status.enum';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

const mockBoardsService = {
  // morking 방법 1
  // 서비스 생성하면서 morking
  createBoard: jest.fn().mockImplementation((dto, user) =>
    Promise.resolve({
      id: Date.now(),
      title: dto.title,
      description: dto.description,
      status: BoardStatus.PUBLIC,
      user: user.id,
    }),
  ),
  deleteBoard: jest.fn(),
  getBoardById: jest.fn(),
  getAllBoards: jest.fn(),
  updateBoardStatus: jest.fn(),
};

const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('BoardsController', () => {
  let controller: BoardsController;

  const mockBoards = [
    {
      id: 1,
      title: '제목1',
      description: '내용1',
      status: BoardStatus.PUBLIC,
      user: 1,
    },
    {
      id: 2,
      title: '제목2',
      description: '내용2',
      status: BoardStatus.PUBLIC,
      user: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BoardsController],
      providers: [{ provide: BoardsService, useValue: mockBoardsService }],
    })
      .overrideProvider(AuthGuard)
      .useValue(mockGuard)
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

    const user = new User();
    user.id = 1;
    user.username = 'test';
    user.password = 'test';

    expect(await controller.createBoard(dto, user)).toEqual({
      id: expect.any(Number),
      title: dto.title,
      description: dto.description,
      status: BoardStatus.PUBLIC,
      user: user.id,
    });

    expect(mockBoardsService.createBoard).toHaveBeenCalledWith(dto, user);
  });

  it('deleteBoard test', async () => {
    const id = 1;

    const user = new User();
    user.id = 1;
    user.username = 'test';
    user.password = 'test';

    mockBoardsService.deleteBoard.mockImplementation((id: number, user: User) => {
      const found = mockBoards.find((board) => board.id === id && board.user === user.id);

      if (!found) {
        throw new NotFoundException(`Can't find Board with id ${id}`);
      }
    });

    try {
      controller.deleteBoard(id, user);
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }

    expect(mockBoardsService.deleteBoard).toHaveBeenCalledWith(id, user);
  });

  it('getAllBoards test', async () => {
    const user = new User();
    user.id = 1;
    user.username = 'test';
    user.password = 'test';

    // morking 방법 2
    // mockBoards 객체를 리턴한다고 가정
    const mockResult = mockBoards.filter((board) => board.user === user.id);
    mockBoardsService.getAllBoards.mockResolvedValue(mockResult);

    const result = await controller.getAllBoards(user);

    expect(mockBoardsService.getAllBoards).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);
  });

  describe('getBoardById test', () => {
    it('게시물이 있는 경우', async () => {
      const id = 1;

      const mockBoard = mockBoards.find((board) => board.id === id);

      // morking 방법 2
      mockBoardsService.getBoardById.mockResolvedValue(mockBoard);

      const result = await controller.getBoardById(id);

      expect(mockBoardsService.getBoardById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockBoard);
    });

    it('게시물이 없는 경우', async () => {
      const id = 100;

      // morking 방법 2
      mockBoardsService.getBoardById.mockRejectedValue(new NotFoundException());

      try {
        await controller.getBoardById(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
      expect(mockBoardsService.getBoardById).toHaveBeenCalledWith(id);
    });
  });

  it('updateBoardStatus test', async () => {
    const id = 1;

    // morking 방법 2
    // 메서드 재 형성
    mockBoardsService.updateBoardStatus.mockImplementation((id, status) => {
      const board = mockBoards.find((board) => board.id === id);
      board.status = status;

      return board;
    });

    const result = await controller.updateBoardStatus(id, BoardStatus.PRIVATE);

    expect(result.id).toEqual(id);
    expect(result.status).toEqual(BoardStatus.PRIVATE);

    expect(mockBoardsService.updateBoardStatus).toHaveBeenCalledWith(id, BoardStatus.PRIVATE);
  });
});
